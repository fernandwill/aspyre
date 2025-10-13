export const STATUSES = [
  'Applied',
  'Online Assessment',
  'Interview',
  'Accepted',
  'Rejected',
]

export const MAIN_STATUSES = STATUSES.slice(0, 3)
export const OUTCOME_STATUSES = STATUSES.slice(3)
export const JOBS_PER_MODAL_PAGE = 10

export const INITIAL_JOBS = [
  {
    id: '1',
    title: 'Frontend Engineer',
    company: 'Aspyre',
    location: 'Remote · North America',
    link: 'https://jobs.lever.co/example/frontend-engineer',
    status: 'Applied',
    notes: 'Reached out to recruiter on LinkedIn. Waiting for response.',
  },
  {
    id: '2',
    title: 'Product Designer',
    company: 'Bright Labs',
    location: 'Amsterdam, NL',
    link: 'https://boards.greenhouse.io/example/product-designer',
    status: 'Interview',
    notes: 'Second round scheduled next Tuesday.',
  },
  {
    id: '3',
    title: 'Data Scientist',
    company: 'Vector Analytics',
    location: 'Berlin, DE',
    link: 'https://jobs.example.com/vector-analytics/data-scientist',
    status: 'Online Assessment',
    notes: 'Assessment submitted, awaiting feedback.',
  },
]
