import isEmpty from './isEmpty';
import { JA_PUNCTUATION_RANGES } from '../constants';
import isCharInRange from './isCharInRange';

/**
 * Tests a character. Returns true if the character is considered English punctuation.
 * @param  {String} char character string to test
 * @return {Boolean}
 */
function isCharJapanesePunctuation(char = '') {
  if (isEmpty(char)) return false;
  return JA_PUNCTUATION_RANGES.some(([start, end]) =>
    isCharInRange(char, start, end)
  );
}

export default isCharJapanesePunctuation;
