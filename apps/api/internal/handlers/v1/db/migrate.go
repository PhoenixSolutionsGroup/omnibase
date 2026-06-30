package db

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/base64"
	"fmt"
	"net/http"
	"net/url"
	"time"

	"github.com/golang-migrate/migrate/v4"
	_ "github.com/golang-migrate/migrate/v4/database/postgres"
	_ "github.com/golang-migrate/migrate/v4/source/file"
)

func (h *Handler) migrateInstance(dir string) (*migrate.Migrate, error) {
	dsn := fmt.Sprintf("postgres://%s:%s@%s:%s/%s?sslmode=%s&x-no-lock=true&x-migrations-table=%s&x-migrations-table-quoted=true",
		url.QueryEscape(h.dbCfg.User),
		url.QueryEscape(h.dbCfg.Password),
		h.dbCfg.Host,
		h.dbCfg.Port,
		h.dbCfg.Name,
		h.dbCfg.SSLMode,
		url.QueryEscape(`"migrations"."schema_migrations"`),
	)
	return migrate.New(fmt.Sprintf("file://%s", dir), dsn)
}

func (h *Handler) reloadPostgREST() error {
	payload := fmt.Sprintf(`{"role":"authenticated","exp":%d}`, time.Now().Add(time.Minute).Unix())
	header := `{"alg":"HS256","typ":"JWT"}`
	seg1 := base64.RawURLEncoding.EncodeToString([]byte(header))
	seg2 := base64.RawURLEncoding.EncodeToString([]byte(payload))
	mac := hmac.New(sha256.New, []byte(h.dbCfg.SigningKey))
	mac.Write([]byte(seg1 + "." + seg2))
	seg3 := base64.RawURLEncoding.EncodeToString(mac.Sum(nil))
	token := seg1 + "." + seg2 + "." + seg3

	req, err := http.NewRequest("POST", h.postgRESTURL+"/rpc/pgrst_reload", nil)
	if err != nil {
		return fmt.Errorf("failed to create reload request: %w", err)
	}
	req.Header.Set("Authorization", "Bearer "+token)
	req.Header.Set("Content-Type", "application/json")

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return fmt.Errorf("failed to call pgrst_reload: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK && resp.StatusCode != http.StatusNoContent {
		return fmt.Errorf("pgrst_reload returned status %d", resp.StatusCode)
	}
	return nil
}
