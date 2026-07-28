import { steps } from './steps';
import { code } from './code';
import { info } from './info';

export default {
  id: 'jump',
  title: info.title,
  category: info.category,
  getSteps: steps,
  code: code,
  info: info
};
