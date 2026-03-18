// Unified data structure:
// Each item has a `results` array. Every result block is:
// {
//   result: string,
//   author?: { name, email },
//   detailsType?: 'list' | 'html',  // default: 'list'
//   details?: string[],             // used when detailsType === 'list' (or omitted)
//   htmlContent?: string,           // used when detailsType === 'html', injected from backend
// }
// detailsType controls how the details section is rendered:
//   'list'  → standard unordered list from details[]
//   'html'  → raw HTML string from htmlContent (backend-provided custom markup)

export const detectionConfig = [
{
  id: "section-1",
  title: "Manuscript",
  description: "Manuscript-related automated checks",
  items: [
    {
      id: "item-1-1",
      title: "Scope",
      description: "Verifies whether the manuscript aligns with the journal's editorial scope.",
      status: "warning",
      results: [{ result: "Out of scope (if no pre-check decision, 1st decision is mandatory)" }]
    },
    {
      id: "item-1-7",
      title: "Similar Title",
      description: "Prevents duplicate submissions.",
      status: "healthy",
      results: [{ result: "No similar title found" }]
    },
    {
      id: "item-1-8",
      title: "Similar Abstract",
      description: "Monitors for potential self-duplication or redundant publication.",
      status: "error",
      results: [{ result: "Duplicate abstract found in system", detailsType: 'list', details: ["这是另一篇稿件"] }]
    },
    {
      id: "item-1-11",
      title: "Reference",
      description: "Validates bibliography integrity.",
      status: "error",
      results: [{
        result: "Problematic references found",
        detailsType: 'html',
        htmlContent: `<div><div class="retraction-references"><span class="retraction-title">Retraction</span><div class="retraction-info"><span class="retraction-content">Lightweight MDSCA-Net: an end-to-end CAN bus fault diagnosis framework</span><span class="retraction-index">[17]</span></div><div class="retraction-info"><span class="retraction-content">Functional analysis of ceRNA network of lncRNA TSIX/miR-34a-5p/RBP2 in acute myocardial infarction based on GEO database</span><span class="retraction-index">[18]</span></div></div><div class="retraction-references"><span class="retraction-title">Correction</span><div class="retraction-info"><span class="retraction-content">Direct and efficient in situ rubidium extraction from potassium chloride salts</span><span class="retraction-index">[19]</span></div><div class="retraction-info"><span class="retraction-content">New latex agglutination assay for the determination of lactoferrin in human milk</span><span class="retraction-index">[20]</span></div></div><div class="retraction-references"><span class="retraction-title">Withdrawn</span><div class="retraction-info"><span class="retraction-content">WITHDRAWN: Rare plexiform neurofibroma of the scrotum — A case report</span><span class="retraction-index">[7]</span></div><div class="retraction-info"><span class="retraction-content">WITHDRAWN: The Ill-Thought-Through Aim to Eliminate the Education Gap Across the Socio-Economic Spectrum</span><span class="retraction-index">[10]</span></div></div></div>`
      }]
    },
    {
      id: "item-1-13",
      title: "Zero Font Attacks",
      description: "Detects hidden text attempts in manuscripts.",
      status: "error",
      results: [{ result: "Hidden text detected", detailsType: 'list', details: ["zero-width space", "white-font string"] }]
    },
    {
      id: "item-1-14",
      title: "Problematic Phrase",
      description: "Detects problematic content patterns including commercial interests, harmful topics, template text, AI phrases, and editorial misconduct indicators.",
      status: "error",
      results: [
        {
          result: "Potential Commercial Interests detected",
          detailsType: 'list',
          details: ["pharmaceutical sponsor", "device manufacturer"]
        },
        {
          result: "Harmful Topics detected",
          detailsType: 'list',
          details: ["misinformation risk"]
        },
        {
          result: "Template Phrase detected",
          detailsType: 'list',
          details: ["insert title here", "add explanation"]
        },
        {
          result: "AI Generated Phrases detected",
          detailsType: 'list',
          details: ["as is widely acknowledged", "in recent years there has been increasing interest"]
        },
        {
          result: "Tortured Phrase detected",
          detailsType: 'list',
          details: ["multi-sphere electron cloud", "thermal motion aggregator"]
        },
        {
          result: "Publicly Available Data Set referenced",
          detailsType: 'list',
          details: ["Zenodo dataset A12"]
        }
      ]
    }
  ]
},
{
  id: "section-2",
  title: "Author",
  description: "Author identity, history, and compliance checks",
  items: [
    {
      id: "item-2-1",
      title: "Ethic Issue",
      description: "Checks past records to identify authors with known ethical concerns.",
      status: "healthy",
      results: [{ result: "No ethical issues found" }]
    },
    {
      id: "item-2-2",
      title: "Affiliation Watchlist",
      description: "Verifies whether affiliation is recognized.",
      status: "error",
      results: [
        { author: { name: "John Doe", email: "john.doe@example.com" }, result: "Affiliation not in whitelist: Advanced Research Lab Global" }
      ]
    },
    {
      id: "item-2-3",
      title: "Author Blacklist",
      description: "Checks if author is prohibited from submission.",
      status: "healthy",
      results: [{ result: "Author not blacklisted" }]
    },
    {
      id: "item-2-4",
      title: "Doctoral Degree",
      description: "Validates academic qualification of authors.",
      status: "error",
      results: [
        { author: { name: "Jane Smith", email: "jane.smith@example.com" }, result: "No doctoral degree found in profile" },
        { author: { name: "Bob Wilson", email: "bob.wilson@example.com" }, result: "Degree record unverifiable — affiliation not indexed" }
      ]
    },
    {
      id: "item-2-5",
      title: "Suspect Employee",
      description: "Checks if author identity matches MDPI staff.",
      status: "healthy",
      results: [{ result: "No match with internal employee" }]
    },
    {
      id: "item-2-6",
      title: "Author User Name",
      description: "Verifies submitted name matches account identity.",
      status: "warning",
      results: [
        { author: { name: "John K. Doe", email: "john.doe@email.com" }, result: "Submitted name does not match account profile" }
      ]
    },
    {
      id: "item-2-7",
      title: "Author Watchlist",
      description: "Flags authors on monitoring lists.",
      status: "healthy",
      results: [{ result: "Author not on watchlist" }]
    },
    {
      id: "item-2-8",
      title: "Is North Korean",
      description: "Ensures compliance with regional restrictions.",
      status: "healthy",
      results: [{ result: "No restricted regional affiliation" }]
    },
    {
      id: "item-2-9",
      title: "Author Published Papers",
      description: "Checks author's publication volume.",
      status: "error",
      results: [
        { author: { name: "Dr. Michael Chen", email: "michael.chen@example.com" }, result: "15 papers published this year (≥ 12)" }
      ]
    },
    {
      id: "item-2-10",
      title: "Author Submitted Papers",
      description: "Monitors submission frequency.",
      status: "error",
      results: [
        { author: { name: "Dr. Michael Chen", email: "michael.chen@example.com" }, result: "8 manuscripts submitted in last 3 months (≥ 6)", detailsType: 'list', details: ["nutrients-4201234", "ijms-4198765", "cells-4187654"] },
        { author: { name: "Prof. Sarah Johnson", email: "sarah.johnson@example.com" }, result: "7 manuscripts submitted in last 3 months (≥ 6)", detailsType: 'list', details: ["water-4211111", "genes-4209876"] }
      ]
    },
    {
      id: "item-2-11",
      title: "Author Affiliation Potential Interest",
      description: "Highlights affiliation names suggesting commercial influence.",
      status: "error",
      results: [
        { author: { name: "Dr. Lisa Wang", email: "lisa.wang@example.com" }, result: "Potential commercial interest detected", detailsType: 'list', details: ["BioTech Ventures Lab"] }
      ]
    },
    {
      id: "item-2-12",
      title: "Author Country Watchlist",
      description: "Verifies compliance with sanctions lists.",
      status: "healthy",
      results: [{ result: "Country not on sanctions list" }]
    },
    {
      id: "item-2-13",
      title: "Author Retraction",
      description: "Checks external retraction history.",
      status: "error",
      results: [
        { author: { name: "Prof. David Lee", email: "david.lee@example.com" }, result: "1 retracted article(s) found in Scilit" }
      ]
    }
  ]
},
{
  id: "section-3",
  title: "Review Report",
  description: "Automated checks for reviewer reports",
  items: [
    {
      id: "item-3-1",
      title: "Sensitive Words",
      description: "Ensures reviewer comments remain professional.",
      status: "error",
      results: [{ result: "Sensitive language detected in review report", detailsType: 'list', details: ["incompetent analysis", "unprofessional conclusion"] }]
    }
  ]
},
{
  id: "section-4",
  title: "Ethicality",
  description: "Per-file ethical analysis including authors, references, AI writing, and peer review reports.",
  items: [
    {
      id: "item-4-1",
      title: "fileName_1.pdf",
      description: "",
      status: "error",
      results: [],
      ethicality: {
        issues_summary: {
          authors: { warning_count: 2, severe_warning_count: 1 },
          references: { warning_count: 3, severe_warning_count: 0 },
          ai_writing: { human_proportion: 0.52, maybe_ai_proportion: 0.28, likely_ai_proportion: 0.20 },
          peer_review_reports: [
            { human_proportion: 0.80, maybe_ai_proportion: 0.12, likely_ai_proportion: 0.08 },
            { human_proportion: 0.45, maybe_ai_proportion: 0.30, likely_ai_proportion: 0.25 }
          ]
        }
      }
    },
    {
      id: "item-4-2",
      title: "fileName_2.pdf",
      description: "",
      status: "healthy",
      results: [],
      ethicality: {
        issues_summary: {
          authors: { warning_count: 0, severe_warning_count: 0 },
          references: { warning_count: 0, severe_warning_count: 0 },
          ai_writing: { human_proportion: 0.95, maybe_ai_proportion: 0.03, likely_ai_proportion: 0.02 },
          peer_review_reports: [
            { human_proportion: 0.92, maybe_ai_proportion: 0.05, likely_ai_proportion: 0.03 }
          ]
        },
        references_html: null
      }
    }
  ]
},
{
  id: "section-5",
  title: "Ethicality Plan B",
  description: "Alternative ethicality design — expandable author/reference details, AI score-based assessment.",
  items: [
    {
      id: "item-5-1",
      title: "fileName_1.pdf",
      description: "",
      status: "error",
      results: [],
      ethicalityB: {
        authors: [
          {
            name: "Dr. John Smith",
            email: "john.smith@example.com",
            issues: [
              { level: "severe", text: "Issue description" },
              { level: "warning", text: "Issue description" },
            ]
          },
          {
            name: "Prof. Li Wei",
            email: "li.wei@example.com",
            issues: [
              { level: "warning", text: "Issue description" },
            ]
          },
        ],
        references: [
          {
            index: "[1]",
            title: "Studies of the mechanism by which hepatic citrate synthase activity increases in vitamin B12 deprivation.",
            problems: [
              { text: "Out of scope", level: "warning" },
              { text: "Out-of-context reference", level: "warning" },
            ]
          },
          {
            index: "[12]",
            title: "Reduced expression of citrate synthase leads to excessive superoxide formation and cell apoptosis",
            problems: [
              { text: "Out-of-context reference", level: "warning" },
              { text: "Retracted", level: "severe" },
            ]
          },
          {
            index: "[17]",
            title: "Lightweight MDSCA-Net: an end-to-end CAN bus fault diagnosis framework",
            problems: [
              { text: "Retracted", level: "severe" },
            ]
          },
        ],
        ai_writing: {
          manuscript_score: 45,
          peer_review_reports: [{ score: 18 }, { score: 22 }]
        }
      }
    },
    {
      id: "item-5-2",
      title: "fileName_2.pdf",
      description: "",
      status: "healthy",
      results: [],
      ethicalityB: {
        authors: [],
        references: [],
        ai_writing: {
          manuscript_score: 8,
          peer_review_reports: [{ score: 5 }]
        }
      }
    }
  ]
}
]
