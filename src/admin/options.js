export const STYLE_OPTIONS = [
  { value: 'black-grey', label: 'Black and grey' },
  { value: 'color', label: 'Color' },
  { value: 'fine-line', label: 'Fine line' },
  { value: 'linework', label: 'Linework' },
  { value: 'blackwork', label: 'Blackwork' },
  { value: 'lettering', label: 'Lettering' },
  { value: 'traditional', label: 'Traditional' },
  { value: 'realism', label: 'Realism' },
  { value: 'cover-up', label: 'Cover-up' },
];

export const SIZE_OPTIONS = [
  { value: 'small', label: 'Small' },
  { value: 'palm', label: 'Palm' },
  { value: 'medium', label: 'Medium' },
  { value: 'large', label: 'Large' },
];

export const ALT_HINT =
  'Describe what the tattoo shows. Example: Black and grey tattoo of Gogeta from Dragon Ball on the back of the hand';

export const MAX_ALT_LENGTH = 140;
export const MAX_FILE_BYTES = 30 * 1024 * 1024;

export const UNREADABLE_MESSAGE =
  "Couldn't read this photo. Export it as JPG and try again.";
