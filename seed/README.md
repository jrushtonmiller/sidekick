# Demo Seed

`demo-seed.json` contains only synthetic data.

It provides:

- Two organizations for tenant-isolation tests
- Patient, staff, clinician, and admin users
- A synthetic clinician profile
- A primary review-only patient story
- A second appointment-hold story
- Synthetic encounters, conditions, observations, and transcripts
- A fixed demo clock

The seed script should be idempotent and mark created records with `synthetic: true` or `seedVersion`.

Do not copy real names, phone numbers, addresses, license numbers, MRNs, transcripts, or clinical facts into this file.
