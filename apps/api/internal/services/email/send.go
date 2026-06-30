package email

import (
	"context"
	"fmt"
	"strings"

	"api/internal/logger"
)

type SendArgs struct {
	From    string
	To      string
	Subject string
	HTML    string
	Plain   string
}

func (s *Service) Send(ctx context.Context, args SendArgs) error {
	logger.Logger.Debug("Sending email", "to", args.To, "subject", args.Subject)

	from := s.fromOrDefault(args.From)
	msg := buildMessageMultipart(from, args.To, args.Subject, args.HTML, args.Plain)
	if err := s.send(from, args.To, msg); err != nil {
		return fmt.Errorf("%w: %w", SendError, err)
	}
	return nil
}

func buildMessageMultipart(from, to, subject, htmlBody, plainBody string) string {
	if plainBody == "" {
		return buildMessage(from, to, subject, htmlBody)
	}

	const boundary = "----=_Part_0_omnibase"

	var msg strings.Builder
	fmt.Fprintf(&msg, "From: %s\r\n", from)
	fmt.Fprintf(&msg, "To: %s\r\n", to)
	fmt.Fprintf(&msg, "Subject: %s\r\n", subject)
	msg.WriteString("MIME-Version: 1.0\r\n")
	fmt.Fprintf(&msg, "Content-Type: multipart/alternative; boundary=\"%s\"\r\n", boundary)
	msg.WriteString("\r\n")

	fmt.Fprintf(&msg, "--%s\r\n", boundary)
	msg.WriteString("Content-Type: text/plain; charset=UTF-8\r\n\r\n")
	msg.WriteString(plainBody)
	msg.WriteString("\r\n")

	fmt.Fprintf(&msg, "--%s\r\n", boundary)
	msg.WriteString("Content-Type: text/html; charset=UTF-8\r\n\r\n")
	msg.WriteString(htmlBody)
	msg.WriteString("\r\n")

	fmt.Fprintf(&msg, "--%s--\r\n", boundary)
	return msg.String()
}
