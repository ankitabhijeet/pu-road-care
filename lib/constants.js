export const DB_NAME = 'pu-road-care-db';
export const STORE_NAME = 'captures';
export const DB_VERSION = 1;

export const CAPTURE_STEPS = [
  {
    id: 0,
    label: 'Left Close',
    filename: 'left_close.jpg',
    instruction: 'Position yourself to the LEFT of the pothole. Move CLOSE and take the photo.',
    shortLabel: 'L1',
    icon: '↙️',
    direction: 'left',
    distance: 'close',
  },
  {
    id: 1,
    label: 'Left Far',
    filename: 'left_far.jpg',
    instruction: 'Stay on the LEFT side. Step back 2–3 feet for a wider view.',
    shortLabel: 'L2',
    icon: '↖️',
    direction: 'left',
    distance: 'far',
  },
  {
    id: 2,
    label: 'Right Close',
    filename: 'right_close.jpg',
    instruction: 'Move to the RIGHT side of the pothole. Get CLOSE and take the photo.',
    shortLabel: 'R1', 
    icon: '↘️',
    direction: 'right',
    distance: 'close',
  },
  {
    id: 3,
    label: 'Right Far',
    filename: 'right_far.jpg',
    instruction: 'Stay on the RIGHT side. Step back 2–3 feet for a wider view.',
    shortLabel: 'R2',
    icon: '↗️',
    direction: 'right',
    distance: 'far',
  },
];

export const JPEG_QUALITY = 0.92;
export const CAMERA_HEIGHT_METERS = 1.15;
