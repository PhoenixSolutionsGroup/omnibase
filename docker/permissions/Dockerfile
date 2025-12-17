FROM oryd/keto:v0.12.0

USER root

# Install AWS CLI for S3-compatible storage (R2) and unzip
RUN apk add --no-cache aws-cli unzip

# Copy base config and default namespaces
COPY permissions.yml /etc/config/permissions/permissions.yml
COPY namespaces/ /etc/config/permissions/namespaces/

# Copy entrypoint script
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

RUN chown -R ory:ory /etc/config/permissions

USER ory

# Expose ports
EXPOSE 4466 4467

# Use custom entrypoint
ENTRYPOINT ["/entrypoint.sh"]

# Default command (can be overridden)
CMD ["serve", "--config", "/etc/config/permissions/permissions.yml"]
