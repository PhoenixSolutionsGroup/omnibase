package email

import (
	"fmt"
	"net"
	"net/smtp"
	"strings"

	"api/internal/logger"
)

func (s *Service) send(from, to, msg string) error {
	addr := fmt.Sprintf("%s:%s", s.host, s.port)

	if s.disableStartTLS {
		logger.Logger.Debug("Sending email via plain SMTP", "address", addr)
		return s.sendPlain(addr, from, to, msg)
	}

	var auth smtp.Auth
	if s.username != "" && s.password != "" {
		auth = smtp.PlainAuth("", s.username, s.password, s.host)
	}

	logger.Logger.Debug("Sending email via SMTP+STARTTLS", "address", addr)
	if err := smtp.SendMail(addr, auth, from, []string{to}, []byte(msg)); err != nil {
		return fmt.Errorf("%w: %w", SendError, err)
	}
	return nil
}

func (s *Service) sendPlain(addr, from, to, msg string) error {
	conn, err := net.Dial("tcp", addr)
	if err != nil {
		return fmt.Errorf("%w: %w", SendError, err)
	}
	defer conn.Close()

	client, err := smtp.NewClient(conn, s.host)
	if err != nil {
		return fmt.Errorf("%w: %w", SendError, err)
	}
	defer client.Close()

	if err := client.Mail(from); err != nil {
		return fmt.Errorf("%w: %w", SendError, err)
	}
	if err := client.Rcpt(to); err != nil {
		return fmt.Errorf("%w: %w", SendError, err)
	}

	w, err := client.Data()
	if err != nil {
		return fmt.Errorf("%w: %w", SendError, err)
	}
	if _, err := w.Write([]byte(msg)); err != nil {
		return fmt.Errorf("%w: %w", SendError, err)
	}
	if err := w.Close(); err != nil {
		return fmt.Errorf("%w: %w", SendError, err)
	}
	return client.Quit()
}

func buildMessage(from, to, subject, htmlBody string) string {
	var msg strings.Builder
	fmt.Fprintf(&msg, "From: %s\r\n", from)
	fmt.Fprintf(&msg, "To: %s\r\n", to)
	fmt.Fprintf(&msg, "Subject: %s\r\n", subject)
	msg.WriteString("MIME-Version: 1.0\r\n")
	msg.WriteString("Content-Type: text/html; charset=\"UTF-8\"\r\n")
	msg.WriteString("\r\n")
	msg.WriteString(htmlBody)
	return msg.String()
}
