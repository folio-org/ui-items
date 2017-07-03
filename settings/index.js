import _ from 'lodash';
import React from 'react';
import Settings from '@folio/stripes-components/lib/Settings';

import LoanTypesSettings from './LoanTypesSettings';
import MaterialTypesSettings from './MaterialTypesSettings';

const pages = [
  {
    route: 'loantypes',
    label: 'Loan types',
    component: LoanTypesSettings,
    // No perm needed yet
  },
  {
    route: 'mtypes',
    label: 'Material types',
    component: MaterialTypesSettings,
    // No perm needed yet
  },
];

export default props => <Settings {...props} pages={_.sortBy(pages, ['label'])} />;
