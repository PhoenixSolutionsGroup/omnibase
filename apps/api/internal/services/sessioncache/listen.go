package sessioncache

import (
	"context"
	"time"

	"github.com/jackc/pgx/v5"

	"api/internal/logger"
)

type ListenArgs struct {
	DSN string
}

func (c *Cache) Listen(ctx context.Context, args ListenArgs) {
	if c == nil || args.DSN == "" {
		return
	}
	backoff := time.Second
	for ctx.Err() == nil {
		err := c.listenOnce(ctx, args.DSN)
		if ctx.Err() != nil {
			return
		}
		c.Purge()
		logger.Logger.Warn("Session cache listener disconnected", "error", err, "retry_in", backoff.String())
		select {
		case <-ctx.Done():
			return
		case <-time.After(backoff):
		}
		backoff = min(backoff*2, 30*time.Second)
	}
}

func (c *Cache) listenOnce(ctx context.Context, dsn string) error {
	conn, err := pgx.Connect(ctx, dsn)
	if err != nil {
		return err
	}
	defer conn.Close(context.Background())

	if _, err := conn.Exec(ctx, "LISTEN "+pgx.Identifier{Channel}.Sanitize()); err != nil {
		return err
	}
	c.Purge()
	logger.Logger.Info("Session cache listener connected", "channel", Channel)

	for {
		n, err := conn.WaitForNotification(ctx)
		if err != nil {
			return err
		}
		c.apply(n.Payload)
	}
}
