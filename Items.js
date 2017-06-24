import _ from 'lodash';
// We have to remove node_modules/react to avoid having multiple copies loaded.
// eslint-disable-next-line import/no-unresolved
import React, { PropTypes } from 'react';
import Route from 'react-router-dom/Route';
import queryString from 'query-string';

import Pane from '@folio/stripes-components/lib/Pane';
import Paneset from '@folio/stripes-components/lib/Paneset';
import PaneMenu from '@folio/stripes-components/lib/PaneMenu';
import Button from '@folio/stripes-components/lib/Button';
import Icon from '@folio/stripes-components/lib/Icon';
import MultiColumnList from '@folio/stripes-components/lib/MultiColumnList';
import FilterPaneSearch from '@folio/stripes-components/lib/FilterPaneSearch';
import FilterControlGroup from '@folio/stripes-components/lib/FilterControlGroup';
import Layer from '@folio/stripes-components/lib/Layer';
import FilterGroups, { initialFilterState, onChangeFilter } from '@folio/stripes-components/lib/FilterGroups';
import transitionToParams from '@folio/stripes-components/util/transitionToParams';
import makeQueryFunction from '@folio/stripes-components/util/makeQueryFunction';

import ItemForm from './ItemForm';
import ViewItem from './ViewItem';

const filterConfig = [
  {
    label: 'Material Types',
    name: 'item',
    cql: 'materialTypeId',
    values: [], // will be filled in by componentWillUpdate
  }, {
    label: 'Location',
    name: 'location',
    cql: 'location.name',
    values: ['Main Library', 'Annex Library'],
  },
];

class Items extends React.Component {
  static propTypes = {
    stripes: PropTypes.shape({
      connect: PropTypes.func.isRequired,
      logger: PropTypes.shape({
        log: PropTypes.func.isRequired,
      }).isRequired,
    }).isRequired,
    data: PropTypes.object.isRequired,
    resources: PropTypes.shape({
      items: PropTypes.shape({
        hasLoaded: PropTypes.bool.isRequired,
        other: PropTypes.shape({
          totalRecords: PropTypes.number,
          total_records: PropTypes.number,
        }),
        isPending: PropTypes.bool.isPending,
        successfulMutations: PropTypes.arrayOf(
          PropTypes.shape({
            record: PropTypes.shape({
              id: PropTypes.string.isRequired,
            }).isRequired,
          }),
        ),
      }),
    }).isRequired,
    history: PropTypes.shape({
      push: PropTypes.func.isRequired,
    }).isRequired,
    location: PropTypes.shape({
      pathname: PropTypes.string.isRequired,
      search: PropTypes.string,
    }).isRequired,
    match: PropTypes.shape({
      path: PropTypes.string.isRequired,
    }).isRequired,
    mutator: PropTypes.shape({
      addItemMode: PropTypes.shape({
        replace: PropTypes.func,
      }),
      items: PropTypes.shape({
        POST: PropTypes.func,
      }),
    }).isRequired,
  };

  static manifest = Object.freeze({
    addItemMode: {},
    items: {
      type: 'okapi',
      records: 'items',
      path: 'inventory/items',
      GET: {
        params: {
          query: makeQueryFunction(
            'cql.allRecords=1',
            'materialType="$QUERY" or barcode="$QUERY*" or title="$QUERY*"',
            { 'Material Type': 'materialTypeId' },
            filterConfig,
          ),
        },
        staticFallback: { params: {} },
      },
    },
    materialTypes: {
      type: 'okapi',
      path: 'material-types',
      records: 'mtypes',
    },
    loanTypes: {
      type: 'okapi',
      path: 'loan-types',
      records: 'loantypes',
    },
  });

  constructor(props) {
    super(props);

    const query = props.location.search ? queryString.parse(props.location.search) : {};
    this.state = {
      filters: initialFilterState(filterConfig, query.filters),
      selectedItem: {},
      searchTerm: query.query || '',
      sortOrder: query.sort || '',
    };

    this.onClearSearch = this.onClearSearch.bind(this);
    this.onSort = this.onSort.bind(this);
    this.onSelectRow = this.onSelectRow.bind(this);
    this.onClickAddNewItem = this.onClickAddNewItem.bind(this);
    this.onClickCloseNewItem = this.onClickCloseNewItem.bind(this);
    this.onChangeSearch = this.onChangeSearch.bind(this);

    this.onChangeFilter = onChangeFilter.bind(this);
    this.transitionToParams = transitionToParams.bind(this);

    this.collapseDetails = this.collapseDetails.bind(this);
    this.connectedViewItem = props.stripes.connect(ViewItem);
    const logger = props.stripes.logger;
    this.log = logger.log.bind(logger);
  }

  componentWillMount() {
    if (_.isEmpty(this.props.data.addItemMode)) this.props.mutator.addItemMode.replace({ mode: false });
  }

  componentWillReceiveProps(nextProps) {
    const resource = this.props.resources.items;
    if (resource) {
      const sm = nextProps.resources.items.successfulMutations;
      if (sm.length > resource.successfulMutations.length) {
        this.onSelectRow(undefined, { id: sm[0].record.id });
      }
    }
  }

  componentWillUpdate() {
    const mt = this.props.data.materialTypes;
    if (mt && mt.length) {
      filterConfig[0].values = mt.map(rec => ({ name: rec.name, cql: rec.id }));
    }
  }

  onClearSearch() {
    this.log('action', 'cleared search');
    this.setState({ searchTerm: '' });
    this.props.history.push(this.props.location.pathname);
  }

  onSort(e, meta) {
    const newOrder = meta.alias;
    const oldOrder = this.state.sortOrder;

    const orders = oldOrder ? oldOrder.split(',') : [];
    if (newOrder === orders[0].replace(/^-/, '')) {
      orders[0] = `-${orders[0]}`.replace(/^--/, '');
    } else {
      orders.unshift(newOrder);
    }

    const sortOrder = orders.slice(0, 2).join(',');
    this.log('action', `sorted by ${sortOrder}`);
    this.setState({ sortOrder });
    this.transitionToParams({ sort: sortOrder });
  }

  onSelectRow(e, meta) {
    const itemId = meta.id;
    this.log('action', `clicked item ${itemId}`);
    this.setState({ selectedItem: meta });
    this.props.history.push(`/items/view/${itemId}${this.props.location.search}`);
  }

  onClickAddNewItem(e) {
    if (e) e.preventDefault();
    this.log('action', 'clicked "add new item"');
    this.props.mutator.addItemMode.replace({ mode: true });
  }

  onClickCloseNewItem(e) {
    if (e) e.preventDefault();
    this.log('action', 'clicked "close new item"');
    this.props.mutator.addItemMode.replace({ mode: false });
  }

  onChangeSearch(e) {
    const query = e.target.value;
    this.setState({ searchTerm: query });
    this.log('action', `will search for '${query}'`);
    this.performSearch(query);
  }

  performSearch = _.debounce((query) => {
    this.log('action', `searched for '${query}'`);
    this.transitionToParams({ query });
  }, 250);

  updateFilters(filters) { // provided for onChangeFilter
    this.transitionToParams({ filters: Object.keys(filters).filter(key => filters[key]).join(',') });
  }

  create(data) {
    // POST item record
    this.log('action', `Creating new item record: ${JSON.stringify(data)}`);
    this.props.mutator.items.POST(data);
    this.onClickCloseNewItem();
  }

  collapseDetails() {
    this.setState({
      selectedItem: {},
    });
    this.props.history.push(`${this.props.match.path}${this.props.location.search}`);
  }

  render() {
    const { data, stripes } = this.props;
    const items = data.items || [];

    /* searchHeader is a 'custom pane header'*/
    const searchHeader = <FilterPaneSearch id="SearchField" onChange={this.onChangeSearch} onClear={this.onClearSearch} value={this.state.searchTerm} />;
    const resultMenu = <PaneMenu><button><Icon icon="bookmark" /></button></PaneMenu>;

    const resultsFormatter = {
      'Material Type': x => _.get(x, ['materialType', 'name']),
      location: x => _.get(x, ['location', 'name']),
      status: x => _.get(x, ['status', 'name']) || '--',
    };

    return (
      <Paneset>
        {/* Filter Pane */}
        <Pane defaultWidth="16%" header={searchHeader}>
          <FilterGroups config={filterConfig} filters={this.state.filters} onChangeFilter={this.onChangeFilter} />
          <FilterControlGroup label="Actions">
            <Button fullWidth onClick={this.onClickAddNewItem}>New item</Button>
          </FilterControlGroup>
        </Pane>
        {/* Results Pane */}
        <Pane
          defaultWidth="fill"
          paneTitle={
            <div style={{ textAlign: 'center' }}>
              <strong>Results</strong>
              <div>
                <em>{this.props.resources.items && this.props.resources.items.hasLoaded ? this.props.resources.items.other.totalRecords : ''} Result{items.length === 1 ? '' : 's'} Found</em>
              </div>
            </div>
          }
          lastMenu={resultMenu}
        >
          <MultiColumnList
            contentData={items}
            selectedRow={this.state.selectedItem}
            rowMetadata={['title', 'id']}
            formatter={resultsFormatter}
            onRowClick={this.onSelectRow}
            onHeaderClick={this.onSort}
            visibleColumns={['Material Type', 'location', 'barcode', 'title', 'status']}
            sortOrder={this.state.sortOrder.replace(/^-/, '').replace(/,.*/, '')}
            sortDirection={this.state.sortOrder.startsWith('-') ? 'descending' : 'ascending'}
            isEmptyMessage={`No results found for "${this.state.searchTerm}". Please check your spelling and filters.`}
            loading={this.props.resources.items ? this.props.resources.items.isPending : false}
            autosize
            virtualize
          />
        </Pane>

        {/* Details Pane */}
        <Route
          path={`${this.props.match.path}/view/:itemid`}
          render={props => <this.connectedViewItem stripes={stripes} paneWidth="44%" onClose={this.collapseDetails} {...props} />}
        />
        <Layer isOpen={data.addItemMode ? data.addItemMode.mode : false} label="Add New Item Dialog">
          <ItemForm
            initialValues={{ available_material_types: this.props.data.materialTypes, available_loan_types: this.props.data.loanTypes, status: { name: 'Available' }, instanceId: 'dummy' }}
            onSubmit={(record) => { this.create(record); }}
            onCancel={this.onClickCloseNewItem}
            okapi={this.props.okapi}
          />
        </Layer>
      </Paneset>
    );
  }
}

export default Items;
