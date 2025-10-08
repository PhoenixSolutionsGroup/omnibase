#!/bin/sh
set -e

# Generate the kratos.yml from template
generate_config() {
    local template_file="/etc/config/kratos/kratos.tmpl.yml"
    local output_file="/tmp/kratos.yml"
    
    # Build OIDC providers with env vars already substituted
    local providers=""
    local oidc_dir="/etc/config/kratos/oidc"
    
    if [ -d "$oidc_dir" ]; then
        for provider_dir in "$oidc_dir"/*; do
            if [ -d "$provider_dir" ]; then
                provider_name=$(basename "$provider_dir")
                provider_upper=$(echo "$provider_name" | tr '[:lower:]' '[:upper:]')
                enabled_var="OIDC_${provider_upper}_ENABLED"
                enabled_value=$(eval echo \$$enabled_var)
                
                if [ "$enabled_value" = "true" ]; then
                    provider_template="$provider_dir/oidc.yml"
                    if [ -f "$provider_template" ]; then
                        # Read entire provider config and substitute env vars
                        provider_config=$(sed \
                            -e "s|\${GOOGLE_CLIENT_ID}|${GOOGLE_CLIENT_ID}|g" \
                            -e "s|\${GOOGLE_CLIENT_SECRET}|${GOOGLE_CLIENT_SECRET}|g" \
                            -e "s|\${GITHUB_CLIENT_ID}|${GITHUB_CLIENT_ID}|g" \
                            -e "s|\${GITHUB_CLIENT_SECRET}|${GITHUB_CLIENT_SECRET}|g" \
                            "$provider_template")
                        
                        # Add proper indentation (10 spaces for first line, 12 for rest)
                        first_line=true
                        while IFS= read -r line; do
                            if [ "$first_line" = true ]; then
                                providers="${providers}
          - ${line}"
                                first_line=false
                            else
                                providers="${providers}
            ${line}"
                            fi
                        done <<EOF
$provider_config
EOF
                    fi
                fi
            fi
        done
    fi
    
    if [ -z "$providers" ]; then
        providers=" []"
    fi
    
    # Step 1: Replace {{OIDC_PROVIDERS}} placeholder
    awk -v providers="$providers" '{gsub(/\{\{OIDC_PROVIDERS\}\}/, providers)}1' "$template_file" > "$output_file.tmp"
    
    # Step 2: Process remaining env vars (outside of providers section which is already done)
    while IFS= read -r line; do
        eval "echo \"$line\""
    done < "$output_file.tmp" > "$output_file"
    
    rm -f "$output_file.tmp"
}

# Generate the configuration
generate_config

exec kratos "$@" -c /tmp/kratos.yml