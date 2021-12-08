import chalk from 'chalk';
import pluralize from 'pluralize';
import { dedent } from 'ts-dedent';

import { info } from '../../components/icons';

export default ({ globCount, moduleCount }) => {
  const globs = pluralize('CSF glob', globCount, true);
  const modules = pluralize('user module', moduleCount, true);
  return dedent(chalk`
    ${info} {bold TurboSnap enabled}
    Found ${globs} and traced ${modules}.
  `);
};
