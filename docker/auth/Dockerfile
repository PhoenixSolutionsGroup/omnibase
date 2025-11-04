FROM oryd/kratos:v1.3.0

# Install envsubst (part of gettext package) and curl for template downloads
USER root
RUN apk add --no-cache gettext curl

# Copy default config (can be overridden via volume mounts)
COPY kratos.tmpl.yml /etc/config/kratos/kratos.tmpl.yml
COPY oidc/ /etc/config/kratos/oidc/
COPY identity.schema.json /etc/config/kratos/identity.schema.json
COPY jwt/ /etc/config/kratos/jwt/

COPY --chmod=755 entrypoint.sh /usr/local/bin/entrypoint.sh

# Expose ports
EXPOSE 4433 4434

# Use custom entrypoint for config templating/initialization
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
CMD ["serve", "--config", "/etc/config/kratos/kratos.yml"]
