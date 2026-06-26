package database

import (
	"context"
	"fmt"
	"sync"
	"time"

	"api/internal/config"
	"api/internal/database/repository"

	"github.com/jackc/pgx/v5/pgxpool"
)

var (
	pool     *pgxpool.Pool
	poolOnce sync.Once
	poolErr  error
)

type Pool = pgxpool.Pool

type DatabaseClient struct {
	Pool *pgxpool.Pool
	Repo *repository.Queries
}

func GetPool(cfg config.DatabaseConfig) (*pgxpool.Pool, error) {
	poolOnce.Do(func() {
		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		p, err := pgxpool.New(ctx, cfg.DSN())
		if err != nil {
			poolErr = fmt.Errorf("create pgx pool: %w", err)
			return
		}
		if err := p.Ping(ctx); err != nil {
			p.Close()
			poolErr = fmt.Errorf("ping pgx pool: %w", err)
			return
		}
		pool = p
	})
	return pool, poolErr
}
