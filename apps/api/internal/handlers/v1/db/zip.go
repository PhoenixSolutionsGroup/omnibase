package db

import (
	"archive/zip"
	"io"
	"os"
	"path/filepath"

	"api/internal/logger"
)

func extractMigrationZip(zipFile io.Reader, dstDir string) error {
	tmp, err := os.CreateTemp("", "migrations-*.zip")
	if err != nil {
		return err
	}
	defer os.Remove(tmp.Name())
	defer tmp.Close()

	if _, err := io.Copy(tmp, zipFile); err != nil {
		return err
	}

	reader, err := zip.OpenReader(tmp.Name())
	if err != nil {
		return err
	}
	defer reader.Close()

	for _, f := range reader.File {
		if f.FileInfo().IsDir() {
			continue
		}

		base := filepath.Base(f.Name)
		if base != "migration.sql" && base != "down.sql" {
			logger.Logger.Warn("Skipping non-migration file in zip", "name", f.Name)
			continue
		}

		rc, err := f.Open()
		if err != nil {
			return err
		}
		content, err := io.ReadAll(rc)
		rc.Close()
		if err != nil {
			return err
		}

		dir := filepath.Base(filepath.Dir(f.Name))
		newName := dir + ".up.sql"
		if base == "down.sql" {
			newName = dir + ".down.sql"
		}

		if err := os.WriteFile(filepath.Join(dstDir, newName), content, 0644); err != nil {
			return err
		}
	}
	return nil
}
