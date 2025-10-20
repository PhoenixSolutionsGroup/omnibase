FROM oryd/kratos:v1.3.0

# Copy default config (can be overridden via volume mounts)
COPY kratos.yml /etc/config/kratos/kratos.yml
COPY kratos.tmpl.yml /etc/config/kratos/kratos.tmpl.yml
COPY oidc/ /etc/config/kratos/oidc/
COPY --chmod=755 entrypoint.sh /usr/local/bin/entrypoint.sh

# Expose ports
EXPOSE 4433 4434

# Use custom entrypoint for config templating/initialization
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
CMD ["serve", "--config", "/etc/config/kratos/kratos.yml"]
