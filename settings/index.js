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
    perm: 'settings.loan-types.all',
  },
  {
    route: 'mtypes',
    label: 'Material types',
    component: MaterialTypesSettings,
    perm: 'settings.material-types.all',
  },
];

export default props => <Settings {...props} pages={_.sortBy(pages, ['label'])} />;
