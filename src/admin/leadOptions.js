export const LEAD_STATUSES = ['new', 'contacted', 'quoted', 'booked', 'done', 'passed'];

export const LEAD_STATUS_LABELS = {
  new: 'New',
  contacted: 'Contacted',
  quoted: 'Quoted',
  booked: 'Booked',
  done: 'Done',
  passed: 'Passed',
};

export function leadStatusLabel(status) {
  return LEAD_STATUS_LABELS[status] || status;
}
