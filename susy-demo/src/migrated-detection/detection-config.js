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
      description: "Verifies whether the manuscript conforms to the editorial scope of the journal.",
      status: "warning",
      results: [{ result: "Out of scope (if no pre-check decision, 1st decision is mandatory)" }]
    },
    {
      id: "item-1-2",
      title: "Problematic Phrase",
      description: "Detect the presence of specified keywords within the manuscript.",
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
    },
    {
      id: "item-1-7",
      title: "Similar Title",
      description: "Prevents duplicate submissions.",
      status: "error",
      results: [
        {
          result: "Duplicate title found in system",
          detailsType: 'list',
          details: ["IJMS-100086"]
        }
      ]
    },
    {
      id: "item-1-8",
      title: "Similar Abstract",
      description: "Monitors authors for potential self-plagiarism or redundant publications.",
      status: "error",
      results: [{ result: "Duplicate abstract found in system", detailsType: 'list', details: ["IJMS-100086","IJMS-100087"] }]
    },
    {
      id: "item-1-11",
      title: "Reference",
      description: "Verify the correctness and validity of references.",
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
      description: "Detects attempts to use hidden text to manipulate content analysis systems.",
      status: "error",
      results: [
        {
          result: "Hidden text detected. See the guideline {{here}}",
          resultSlots: {
            here: { type: 'link', content: 'here',  href: '#' },
          },
          detailsType: 'list',
          details: ["abc", "xyz"]
        }
      ]
    },
    {
      id: "item-1-14",
      title: "English Editing Assistant",
      description: "Assess the English proficiency of manuscripts.",
      status: "warning",
      results: [{ result: "ASQ Score: 89.15" }]
    },
  ]
},
{
  id: "section-2",
  title: "Author",
  items: [
    {
      id: "item-2-1",
      title: "Ethic Issue",
      description: "Reviews historical records to identify authors with a track record of ethical issues.",
      status: "error",
      results: [{ 
        result: "Ethical issue record found for author {{Detail}}",
        resultSlots: {
          Detail: { type: 'link', content: 'View Detail',  href: '#' },
          } }]
    },
    {
      id: "item-2-2",
      title: "Affiliation Watchlist",
      description: "Verifies whether the author's affiliation is recognized in the trusted institutional list.",
      status: "warning",
      results: [
        { author: { name: "John Doe", email: "john.doe@example.com" }, result: "Author affiliation not found in whitelist ({Peking University})" }
      ]
    },
    {
      id: "item-2-3",
      title: "Author Blacklist",
      description: "Prohibits submissions from authors included in the system blacklist.",
      status: "error",
      results: [{ author: { name: "Hongqiang Cui", email: "hongqiang@example.com" },result: "Author is blacklisted" }]
    },
    {
      id: "item-2-4",
      title: "Doctoral Degree",
      description: "Verifies the doctoral-level degrees held by the author team.",
      status: "warning",
      results: [
        { result: "Not all authors have a Doctoral Degree" }
      ]
    },
    {
      id: "item-2-5",
      title: "Suspect Employee",
      description: "Checks if author identity matches MDPI staff.",
      status: "error",
      results: [{ author: { name: "Hqiang Cui", email: "hongqiang@mdpi.com" },result: "Author identity matches an internal employee: Hongqiang Cui (hongqiang.cui@mdpi.com)" }]
    },
    {
      id: "item-2-6",
      title: "Author User Name",
      description: "Verifies submission author name matches registered account identity.",
      status: "warning",
      results: [
        { author: { name: "John K. Doe", email: "john.doe@email.com" }, result: "Submitted name does not match account profile: John Another. Doe (john.doe@email.com)" }
      ]
    },
    {
      id: "item-2-7",
      title: "Author Watchlist",
      description: "Flags authors listed on academic risk monitoring watchlists.",
      status: "error",
      results: [{ name: "John K. Doe", email: "john.doe@email.com" ,result: "Author is on the watchlist." }]
    },
    {
      id: "item-2-8",
      title: "Is North Korean",
      description: "Ensures compliance with specific regional regulatory restrictions.",
      status: "error",
      results: [{ author: { name: "Hongqiang C", email: "hongqiang@email.com" },result: "Author affiliation is subject to regional restrictions." }]
    },
    {
      id: "item-2-9",
      title: "Author Published Papers",
      description: "Monitors publication output to identify abnormal productivity trends.",
      status: "error",
      results: [
        { author: { name: "Dr. Michael Chen", email: "michael.chen@example.com" }, result: "High publication volume detected: 15 papers (≥ 12) this year." }
      ]
    },
    {
      id: "item-2-10",
      title: "Author Submitted Papers",
      description: "Monitors submission frequency to identify abnormal activity.",
      status: "error",
      results: [
        { author: { name: "Dr. Michael Chen", email: "michael.chen@example.com" }, result: "High submission frequency detected: 15 manuscripts (≥ 12) in a year." }
      ]
    },
    // {
    //   id: "item-2-10",
    //   title: "Author Submitted Papers",
    //   description: "Monitors submission frequency.",
    //   status: "error",
    //   results: [
    //     {
    //       author: { name: "Dr. Michael Chen", email: "michael.chen@example.com" },
    //       result: "manuscripts submitted in last 3 months (≥ 6) {{guide}} {{icon}}",
    //       resultSlots: {
    //         guide: { type: 'link', content: 'view guide',  href: '#' },
    //         icon: { type: 'tooltip', tooltip: 'hover text',icon: 'info' },

    //       },
    //       detailsType: 'list',
    //       details: ["nutrients-4201234", "ijms-4198765", "cells-4187654"]
    //     },
    //     {
    //       author: { name: "Prof. Sarah Johnson", email: "sarah.johnson@example.com" },
    //       result: "7 manuscripts submitted in last 3 months (≥ 6)",
    //       detailsType: 'list',
    //       details: ["water-4211111", "genes-4209876"]
    //     }
    //   ]
    // },
    {
      id: "item-2-11",
      title: "Problematic information",
      description: "Detect the presence of specified keywords within the author’s information.",
      status: "error",
      results: [
        { author: { name: "Dr. Lisa Wang", email: "lisa.wang@example.com" }, result: "Potential commercial interest detected in affiliation", detailsType: 'list', details: ["BioTech Ventures Lab"] },
        { author: { name: "Another author", email: "another@example.com" }, result: "Potential commercial interest detected in affiliation（不同的作者，即使是同样的类别，也要用两个块来展示）", detailsType: 'list', details: ["BioTech Ventures Lab"] },
        { author: { name: "Hongqiang Cui", email: "chq@example.com" }, result: "另一个类别 detected in affiliation", detailsType: 'list', details: ["keywords1","keywords2"] }

      ]
    },
    {
      id: "item-2-12",
      title: "Author Country Watchlist",
      description: "Verifies compliance with international sanctions lists.",
      status: "error",
      results: [{ author: { name: "Hongqiang Cui", email: "hongqiang@example.com" },result: "North Korea is sanctioned country, please check {{list}} whether the author/institution is on the sanctions list",resultSlots: {
            list: { type: 'link', content: 'Swiss Sanctions list',  href: '#' },
           }, }]
    },
    {
      id: "item-2-13",
      title: "Author Retraction",
      description: "Check the retraction records of all authors.",
      status: "error",
      results: [
        { author: { name: "Prof. David Lee", email: "david.lee@example.com" }, result: "1 retracted article(s) found in {{Scilit}}",resultSlots: {
            Scilit: { type: 'link', content: 'Scilit',  href: '#' }, }},
        { author: { name: "Dr. Michael Chen", email: "michael.chen@example.com" }, result: "2 retracted article(s) found in {{Scilit}}",resultSlots: {
            Scilit: { type: 'link', content: 'Scilit',  href: '#' }, }}
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
      title: "Problematic comment",
      description: "Detect the presence of specified keywords within the peer-review comment.",
      status: "error",
      results: [
        { 
          result: "Harmful Topics detected in {{report}}.",
          resultSlots: {
            report: { type: 'link', content: 'Review Report',  href: '#' },
           }, 
          detailsType: 'list', 
          details: ["incompetent analysis", "unprofessional conclusion"] 
        },
        { 
          result: "另一个类别 detected in {{report}}.",
          resultSlots: {
            report: { type: 'link', content: 'Review Report',  href: '#' },
           }, 
          detailsType: 'list', 
          details: ["incompetent analysis", "unprofessional conclusion"] 
        }
      ]
    }
  ]
}
]
