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
        htmlContent: `<div><div class="retraction-references"><span class="retraction-title">Retraction</span><div class="retraction-info"><span class="retraction-index">[17]</span><span class="retraction-content">Lightweight MDSCA-Net: an end-to-end CAN bus fault diagnosis framework</span><a class="retraction-doi" href="https://doi.org/10.1016/j.ress.2023.109512" target="_blank">DOI: 10.1016/j.ress.2023.109512</a></div><div class="retraction-info"><span class="retraction-index">[18]</span><span class="retraction-content">Functional analysis of ceRNA network of lncRNA TSIX/miR-34a-5p/RBP2 in acute myocardial infarction based on GEO database</span><a class="retraction-doi" href="https://doi.org/10.3389/fgene.2022.887722" target="_blank">DOI: 10.3389/fgene.2022.887722</a></div></div><div class="retraction-references"><span class="retraction-title">Correction</span><div class="retraction-info"><span class="retraction-index">[19]</span><span class="retraction-content">Direct and efficient in situ rubidium extraction from potassium chloride salts</span><a class="retraction-doi" href="https://doi.org/10.1039/D2GC03451A" target="_blank">DOI: 10.1039/D2GC03451A</a></div><div class="retraction-info"><span class="retraction-index">[20]</span><span class="retraction-content">New latex agglutination assay for the determination of lactoferrin in human milk</span><a class="retraction-doi" href="https://doi.org/10.1016/j.foodchem.2021.130856" target="_blank">DOI: 10.1016/j.foodchem.2021.130856</a></div></div><div class="retraction-references"><span class="retraction-title">Withdrawn</span><div class="retraction-info"><span class="retraction-index">[7]</span><span class="retraction-content">WITHDRAWN: Rare plexiform neurofibroma of the scrotum — A case report</span><a class="retraction-doi" href="https://doi.org/10.1016/j.urology.2020.08.042" target="_blank">DOI: 10.1016/j.urology.2020.08.042</a></div><div class="retraction-info"><span class="retraction-index">[10]</span><span class="retraction-content">WITHDRAWN: The Ill-Thought-Through Aim to Eliminate the Education Gap Across the Socio-Economic Spectrum</span><a class="retraction-doi" href="https://doi.org/10.1080/00131857.2021.1873516" target="_blank">DOI: 10.1080/00131857.2021.1873516</a></div></div></div>`
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
        {
          author: { name: "Dr. Michael Chen", email: "michael.chen@example.com" },
          result: "manuscripts submitted in last 3 months (≥ 6) {{guide}} {{icon}}",
          resultSlots: {
            guide: { type: 'link', content: 'view guide',  href: '#' },
            icon: { type: 'tooltip', tooltip: 'hover text',icon: 'info' },

          },
          detailsType: 'list',
          details: ["nutrients-4201234", "ijms-4198765", "cells-4187654"]
        },
        {
          author: { name: "Prof. Sarah Johnson", email: "sarah.johnson@example.com" },
          result: "7 manuscripts submitted in last 3 months (≥ 6)",
          detailsType: 'list',
          details: ["water-4211111", "genes-4209876"]
        }
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
  items: [
    {
      id: "item-3-1",
      title: "Sensitive Words",
      description: "Ensures reviewer comments remain professional.",
      status: "error",
      results: [{ result: "Sensitive language detected in review report", detailsType: 'list', details: ["incompetent analysis", "unprofessional conclusion"] }]
    }
  ]
}
]
