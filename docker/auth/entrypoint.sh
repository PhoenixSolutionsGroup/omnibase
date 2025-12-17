#!/bin/sh
set -e

wait_for_api_health() {
    if [ -z "${API_URL}" ]; then
        echo "Skipping API health check (API_URL not set)" >&2
        return 0
    fi
    
    if [ "${WAIT_FOR_API_HEALTH}" != "true" ]; then
        echo "Skipping API health check (WAIT_FOR_API_HEALTH not set to true)" >&2
        return 0
    fi
    
    echo "Waiting for rest-api to be healthy..." >&2
    
    local health_url="${API_URL}/health"
    local max_attempts=10
    local wait_seconds=3
    local attempt=0
    
    while [ $attempt -lt $max_attempts ]; do
        attempt=$((attempt + 1))
        echo "Health check attempt $attempt/$max_attempts: $health_url" >&2
        
        if curl -f -s --connect-timeout 2 --max-time 5 -o /dev/null "$health_url" 2>/dev/null; then
            echo "✓ rest-api is healthy" >&2
            return 0
        else
            if [ $attempt -lt $max_attempts ]; then
                echo "✗ rest-api not ready, waiting ${wait_seconds}s..." >&2
                sleep $wait_seconds
            fi
        fi
    done
    
    echo "✗ rest-api failed health check after $max_attempts attempts" >&2
    echo "  Proceeding anyway - template downloads may fail" >&2
    return 1
}

ensure_jwks() {
    local jwks_dir="/tmp/auth/tokenizer-templates/jwt"
    local jwks_file="$jwks_dir/jwks.json"
    
    if [ -z "$AUTH_JWT_JWKS" ]; then
        echo "ERROR: AUTH_JWT_JWKS environment variable is not set" >&2
    fi
    
    echo "Creating JWKS directory: $jwks_dir" >&2
    mkdir -p "$jwks_dir"
    
    echo "Writing JWKS to: $jwks_file" >&2
    printf '%b\n' "$AUTH_JWT_JWKS" > "$jwks_file"
    chmod 600 "$jwks_file"
}

download_templates() {
    if [ -z "${API_URL}" ]; then
        echo "Skipping template download (API_URL not set, will use Auth defaults)" >&2
        return 0
    fi
    
    template_dir="/tmp/auth/templates"
    
    echo "Creating template directories" >&2
    mkdir -p "$template_dir/verification/valid" "$template_dir/recovery/valid"
    mkdir -p "$template_dir/verification_invalid/valid" "$template_dir/recovery_invalid/valid"
    
    # List of templates to download: format is "flow/type"
    templates="verification/subject verification/body verification/plaintext recovery/subject recovery/body recovery/plaintext verification_invalid/subject verification_invalid/body verification_invalid/plaintext recovery_invalid/subject recovery_invalid/body recovery_invalid/plaintext"
    
    echo "Downloading templates concurrently..." >&2
    
    # Download all templates in background
    for template in $templates; do
        (
            template_name="${template%/*}"
            template_type="${template#*/}"
            
            # Map type to filename
            filename=""
            case "$template_type" in
                subject) filename="email.subject.gotmpl" ;;
                body) filename="email.body.gotmpl" ;;
                plaintext) filename="email.body.plaintext.gotmpl" ;;
            esac
            
            url="${API_URL}/api/v1/email/templates/${template_name}/${template_type}"
            output="$template_dir/$template_name/valid/$filename"
            
            if curl -f -s --connect-timeout 2 --max-time 5 -o "$output" "$url" 2>/dev/null; then
                echo "✓ Downloaded: $template_name/$template_type" >&2
            else
                echo "✗ Failed to download $template_name/$template_type (will use Auth defaults)" >&2
            fi
        ) &
    done
    
    # Wait for all downloads to complete
    wait
    
    echo "Template download process complete" >&2
}

generate_config() {
    local template_file="/etc/config/auth/auth.tmpl.yml"
    local output_file="/tmp/auth.yml"
    
    # Build OIDC providers (raw, no substitution yet)
    local providers=""
    local oidc_dir="/etc/config/auth/oidc"
    
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
                        # Read raw YAML (env vars still in ${VAR} format)
                        provider_config=$(cat "$provider_template")
                        
                        # Add proper indentation
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
    
    # Step 1: Inject OIDC providers into template
    awk -v providers="$providers" '{gsub(/\{\{OIDC_PROVIDERS\}\}/, providers)}1' "$template_file" > "$output_file.tmp"
    
    # Step 2: Substitute ALL environment variables in the entire config
    > "$output_file"
    while IFS= read -r line; do
        eval "echo \"$line\"" >> "$output_file"
    done < "$output_file.tmp"
    
    rm -f "$output_file.tmp"
}

ensure_jwks

wait_for_api_health

download_templates

generate_config

exec kratos "$@" -c /tmp/auth.yml
