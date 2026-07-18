# Reference Sources

## How to use this list

These sources support product assumptions, security design, human-factors recommendations, health-literacy guidance, interoperability direction, and the selected demo form. Recheck all current product, regulatory, and form details before a production launch.

## Selected DMV form

### California DMV REG 195

California Department of Motor Vehicles. Application for Disabled Person Placard or Plates, REG 195, revision 11/2023, currently published as a PDF.

- https://www.dmv.ca.gov/portal/uploads/2024/07/REG-195-R11-2023-AS-WWW-002.pdf

The current PDF includes applicant and medical-provider sections and instructions concerning original signatures. Confirm the exact revision and submission process before use.

### California DMV disabled parking placards and plates

- https://www.dmv.ca.gov/portal/vehicle-registration/license-plates-decals-and-placards/disabled-person-parking-placards-plates/

## HIPAA and privacy

### HHS HIPAA Privacy Rule

- https://www.hhs.gov/hipaa/for-professionals/privacy/index.html

### HHS Summary of the HIPAA Privacy Rule

Includes business associate, safeguards, protected information, and documentation overview.

- https://www.hhs.gov/hipaa/for-professionals/privacy/laws-regulations/index.html

### HHS consumer rights overview

- https://www.hhs.gov/hipaa/for-individuals/guidance-materials-for-consumers/index.html

### NIST digital identity guidance

NIST SP 800-63-4, Digital Identity Guidelines.

- https://pages.nist.gov/800-63-4/

## Google Cloud and Firebase

### Google Cloud HIPAA guidance

- https://cloud.google.com/security/compliance/hipaa

Verify the current covered-products list under the organization's agreement and configure each product appropriately.

### Firebase privacy and security

- https://firebase.google.com/support/privacy

### Firebase custom claims

- https://firebase.google.com/docs/auth/admin/custom-claims

### Firebase Security Rules and Authentication

- https://firebase.google.com/docs/rules/rules-and-auth

### Firestore role-based access

- https://firebase.google.com/docs/firestore/solutions/role-based-access

### Identity Platform multi-tenancy

- https://cloud.google.com/identity-platform/docs/multi-tenancy

Identity tenancy does not replace resource-level application authorization.

## OpenAI platform

### API BAA information

- https://help.openai.com/en/articles/8660679-how-can-i-get-a-business-associate-agreement-baa-with-openai

### API data controls

- https://developers.openai.com/api/docs/guides/your-data

Verify current retention, endpoint, tool, model, and BAA eligibility for the exact production configuration.

### Enterprise privacy

- https://openai.com/enterprise-privacy/

### Business data privacy and compliance

- https://openai.com/business-data/

## Structured AI output and file handling

Use the current official OpenAI API documentation for:

- Responses API
- Structured outputs
- Function calling
- File and image inputs
- Data controls

Do not copy old SDK syntax into the implementation without checking the installed SDK version.

## Patient matching

### ONC patient identity and patient record matching

- https://healthit.gov/standards-and-technology/patient-identity-and-patient-record-matching/

ONC describes patient matching as linking data using multiple demographic fields such as name, birth date, phone number, and address.

### ONC Registrar Playbook

- https://playbook.healthit.gov/playbook/registrar/chapter-1/

The playbook discusses the importance and difficulty of consistent demographic data for matching.

### AHRQ patient matching research

Grannis S. Enhancing Patient Matching in Support of Operational Health Information Exchange, final report, Agency for Healthcare Research and Quality, 2023.

- https://digital.ahrq.gov/ahrq-funded-projects/enhancing-patient-matching-support-operational-health-information-exchange

## Interoperability

### HL7 FHIR specification

- https://hl7.org/fhir/

### FHIR Foundation

- https://fhir.org/

FHIR is a healthcare-interoperability specification. Confirm the version required by the target EMR and US Core implementation guidance.

## Health literacy and plain language

### CDC plain-language resources

- https://www.cdc.gov/health-literacy/php/develop-materials/plain-language.html

### CDC health literacy overview

- https://www.cdc.gov/health-literacy/php/about/index.html

### Oral health communication

Nouri SS, Rudd RE. Health literacy in the oral exchange: an important element of patient-provider communication. Patient Education and Counseling. 2015;98(5):565-571. doi:10.1016/j.pec.2014.12.002. PMID: 25620074.

- https://pubmed.ncbi.nlm.nih.gov/25620074/

## Automation bias and human oversight

### Systematic review of automation bias

Goddard K, Roudsari A, Wyatt JC. Automation bias: a systematic review of frequency, effect mediators, and mitigators. Journal of the American Medical Informatics Association. 2012;19(1):121-127. PMID: 21685142.

- https://pubmed.ncbi.nlm.nih.gov/21685142/
- https://pmc.ncbi.nlm.nih.gov/articles/PMC3240751/

### Verification complexity

Lyell D, Coiera E. Automation bias and verification complexity: a systematic review. Journal of the American Medical Informatics Association. 2017;24(2):423-431. doi:10.1093/jamia/ocw105. PMID: 27516495.

- https://pubmed.ncbi.nlm.nih.gov/27516495/
- https://pmc.ncbi.nlm.nih.gov/articles/PMC7651899/

### Electronic prescribing study

Lyell D, Magrabi F, Raban MZ, et al. Automation bias in electronic prescribing. BMC Medical Informatics and Decision Making. 2017;17:28. doi:10.1186/s12911-017-0425-5. PMID: 28302112.

- https://pubmed.ncbi.nlm.nih.gov/28302112/

### Responsible AI-enabled clinical decision support

Labkoff S, et al. Toward a responsible future: recommendations for AI-enabled clinical decision support. Journal of the American Medical Informatics Association. 2024. PMID: 39325508.

- https://pubmed.ncbi.nlm.nih.gov/39325508/

### Stakeholder perspectives on AI clinical decision support

Giebel GD, Raszke P, Nowak H, et al. Improving AI-Based Clinical Decision Support Systems and Their Integration Into Care From the Perspective of Experts: Interview Study Among Different Stakeholders. JMIR Medical Informatics. 2025;13:e69688. doi:10.2196/69688. PMID: 40623684.

- https://pubmed.ncbi.nlm.nih.gov/40623684/

## Early-stage clinical AI evaluation

Vasey B, Nagendran M, Campbell B, et al. DECIDE-AI reporting guideline for the early-stage clinical evaluation of decision support systems driven by artificial intelligence. Nature Medicine. 2022;28:924-933.

- https://www.nature.com/articles/s41591-022-01772-9

Use clinical AI reporting guidelines as a reference for future pilots. The hackathon is not a clinical evaluation.

## Source review checklist

Before production release:

- Verify each URL and current publication date.
- Verify current official form revision.
- Verify signature acceptance with the recipient.
- Verify current HIPAA and state-law obligations.
- Verify each cloud and AI service under signed agreements.
- Verify the exact SDK and API documentation.
- Review new medical and human-factors evidence.
