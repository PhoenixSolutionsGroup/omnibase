# Git Workflow

## Branch Strategy

```bash
# Create feature branch
git checkout -b pricing/add-pro-tier

# Make changes to stripe.config.json
# Test locally

# Commit with descriptive message
git commit -m "feat(pricing): add Pro tier at $29.99/month"

# Push and create PR
git push origin pricing/add-pro-tier
```

## Pull Request Template

Include in your PR description:
- What changed (products/prices added/updated/removed)
- Why the change was made
- Impact on existing customers
- Migration plan (if applicable)
- Rollback plan

## Review Checklist

Before merging:
- [ ] Version number incremented appropriately
- [ ] All required fields present
- [ ] Meter references are valid
- [ ] Currency codes are correct
- [ ] Tiers have "inf" in last tier
- [ ] UI metadata is complete
- [ ] Git commit message is descriptive