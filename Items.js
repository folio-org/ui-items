import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import Route from 'react-router-dom/Route';
import queryString from 'query-string';

import Pane from '@folio/stripes-components/lib/Pane';
import Paneset from '@folio/stripes-components/lib/Paneset';
import PaneMenu from '@folio/stripes-components/lib/PaneMenu';
import Button from '@folio/stripes-components/lib/Button';
import MultiColumnList from '@folio/stripes-components/lib/MultiColumnList';
import FilterPaneSearch from '@folio/stripes-components/lib/FilterPaneSearch';
import Layer from '@folio/stripes-components/lib/Layer';
import FilterGroups, { initialFilterState, onChangeFilter as commonChangeFilter } from '@folio/stripes-components/lib/FilterGroups';
import SRStatus from '@folio/stripes-components/lib/SRStatus';
import transitionToParams from '@folio/stripes-components/util/transitionToParams';
import makeQueryFunction from '@folio/stripes-components/util/makeQueryFunction';

import ItemForm from './ItemForm';
import ViewItem from './ViewItem';

import packageInfo from './package';

const INITIAL_RESULT_COUNT = 30;
const RESULT_COUNT_INCREMENT = 30;

const filterConfig = [
  {
    label: 'Material Types',
    name: 'item',
    cql: 'materialType.id',
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
    resources: PropTypes.shape({
      materialTypes: PropTypes.shape({
        records: PropTypes.arrayOf(PropTypes.object),
      }),
      loanTypes: PropTypes.shape({
        records: PropTypes.arrayOf(PropTypes.object),
      }),
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
      userCount: PropTypes.number,
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
      itemCount: PropTypes.shape({
        replace: PropTypes.func,
      }),
    }).isRequired,
    okapi: PropTypes.object,
  };

  static manifest = Object.freeze({
    itemCount: { initialValue: INITIAL_RESULT_COUNT },
    addItemMode: { initialValue: { mode: false } },
    items: {
      type: 'okapi',
      records: 'items',
      path: 'inventory/items',
      recordsRequired: '%{itemCount}',
      perRequest: RESULT_COUNT_INCREMENT,
      GET: {
        params: {
          query: makeQueryFunction(
            'cql.allRecords=1',
            'materialType.name="$QUERY" or barcode="$QUERY*" or title="$QUERY*"',
            { 'Material Type': 'materialType.name' },
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

    this.onChangeFilter = commonChangeFilter.bind(this);
    this.transitionToParams = transitionToParams.bind(this);

    this.collapseDetails = this.collapseDetails.bind(this);
    this.connectedViewItem = props.stripes.connect(ViewItem);
    const logger = props.stripes.logger;
    this.log = logger.log.bind(logger);

    this.anchoredRowFormatter = this.anchoredRowFormatter.bind(this);

    this.resultsList = null;
    this.SRStatus = null;
  }

  componentWillReceiveProps(nextProps) {
    const resource = this.props.resources.items;
    if (resource) {
      const sm = nextProps.resources.items.successfulMutations;
      if (sm.length > resource.successfulMutations.length) {
        this.onSelectRow(undefined, { id: sm[0].record.id });
      }
    }

    if (resource && resource.isPending && !nextProps.resources.items.isPending) {
      this.log('event', 'new search-result');
      const resultAmount = nextProps.resources.items.other.totalRecords;
      this.SRStatus.sendMessage(`Search returned ${resultAmount} result${resultAmount !== 1 ? 's' : ''}`);
    }
  }

  componentWillUpdate() {
    const mt = (resources.materialTypes || {}).records || [];
    if (mt && mt.length) {
      filterConfig[0].values = mt.map(rec => ({ name: rec.name, cql: rec.id }));
    }
  }

  onClearSearch() {
    const path = (_.get(packageInfo, ['stripes', 'home']) ||
                  _.get(packageInfo, ['stripes', 'route']));
    this.setState({
      searchTerm: '',
      sortOrder: 'title',
      filters: {},
    });
    this.log('action', `cleared search: navigating to ${path}`);
    this.props.history.push(path);
  }

  onSort(e, meta) {
    const newOrder = meta.alias;
    const oldOrder = this.state.sortOrder || '';

    const orders = oldOrder ? oldOrder.split(',') : [];
    if (orders[0] && newOrder === orders[0].replace(/^-/, '')) {
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

  onChangeFilter = (e) => {
    this.props.mutator.itemCount.replace(INITIAL_RESULT_COUNT);
    this.commonChangeFilter(e);
  }

  onChangeSearch(e) {
    this.props.mutator.itemCount.replace(INITIAL_RESULT_COUNT);
    const query = e.target.value;
    this.setState({ searchTerm: query });
    this.log('action', `will search for '${query}'`);
    this.performSearch(query);
  }

  onNeedMore = () => {
    this.props.mutator.itemCount.replace(this.props.resources.itemCount + RESULT_COUNT_INCREMENT);
  }

  getRowURL(rowData) {
    return `/items/view/${rowData.id}${this.props.location.search}`;
  }

  performSearch = _.debounce((query) => {
    this.log('action', `searched for '${query}'`);
    this.transitionToParams({ query });
  }, 250);

  updateFilters(filters) { // provided for onChangeFilter
    this.transitionToParams({ filters: Object.keys(filters).filter(key => filters[key]).join(',') });
  }

  create(item) {
    // POST item record
    this.log('action', `Creating new item record: ${JSON.stringify(item)}`);
    this.props.mutator.items.POST(item);
    this.onClickCloseNewItem();
  }

  collapseDetails() {
    this.setState({
      selectedItem: {},
    });
    this.props.history.push(`${this.props.match.path}${this.props.location.search}`);
  }

  anchoredRowFormatter(
    { rowIndex,
      rowClass,
      rowData,
      cells,
      rowProps,
      labelStrings,
    },
  ) {
    return (
      <a
        href={this.getRowURL(rowData)} key={`row-${rowIndex}`}
        aria-label={labelStrings && labelStrings.join('...')}
        role="listitem"
        className={rowClass}
        {...rowProps}
      >
        {cells}
      </a>
    );
  }

  render() {
    const { resources, stripes } = this.props;
    const items = (resources.items || {}).records || [];
    const materialTypes = (resources.materialTypes || {}).records || [];
    const loanTypes = (resources.loanTypes || {}).records || [];

    /* searchHeader is a 'custom pane header'*/
    const searchHeader = <FilterPaneSearch id="SearchField" onChange={this.onChangeSearch} onClear={this.onClearSearch} resultsList={this.resultsList} value={this.state.searchTerm} />;
    const newItemButton = <PaneMenu><Button onClick={this.onClickAddNewItem} title="+ Item" buttonStyle="primary paneHeaderNewButton">+ New</Button></PaneMenu>;

    const resultsFormatter = {
      'Material Type': x => _.get(x, ['materialType', 'name']),
      location: x => _.get(x, ['location', 'name']),
      status: x => _.get(x, ['status', 'name']) || '--',
    };

    const maybeTerm = this.state.searchTerm ? ` for "${this.state.searchTerm}"` : '';
    const maybeSpelling = this.state.searchTerm ? 'spelling and ' : '';
    return (
      <Paneset>
        <SRStatus ref={(ref) => { this.SRStatus = ref; }} />
        {/* Filter Pane */}
        <Pane defaultWidth="16%" header={searchHeader}>
          <FilterGroups config={filterConfig} filters={this.state.filters} onChangeFilter={this.onChangeFilter} />
        </Pane>
        {/* Results Pane */}
        <Pane
          defaultWidth="fill"
          paneTitle={
            <div style={{ textAlign: 'center' }}>
              <strong>Items</strong>
              <div>
                <em>{this.props.resources.items && this.props.resources.items.hasLoaded ? this.props.resources.items.other.totalRecords : ''} Result{items.length === 1 ? '' : 's'} Found</em>
              </div>
            </div>
          }
          lastMenu={newItemButton}
        >
          <MultiColumnList
            contentData={items}
            selectedRow={this.state.selectedItem}
            rowMetadata={['title', 'id']}
            formatter={resultsFormatter}
            onRowClick={this.onSelectRow}
            onHeaderClick={this.onSort}
            onNeedMoreData={this.onNeedMore}
            visibleColumns={['Material Type', 'location', 'barcode', 'title', 'status']}
            sortOrder={this.state.sortOrder.replace(/^-/, '').replace(/,.*/, '')}
            sortDirection={this.state.sortOrder.startsWith('-') ? 'descending' : 'ascending'}
            isEmptyMessage={`No results found${maybeTerm}. Please check your ${maybeSpelling}filters.`}
            loading={this.props.resources.items ? this.props.resources.items.isPending : false}
            autosize
            virtualize
            ariaLabel={'Item search results'}
            rowFormatter={this.anchoredRowFormatter}
            containerRef={(ref) => { this.resultsList = ref; }}
          />
        </Pane>

        {/* Details Pane */}
        <Route
          path={`${this.props.match.path}/view/:itemid`}
          render={props => <this.connectedViewItem stripes={stripes} paneWidth="44%" onClose={this.collapseDetails} {...props} />}
        />
        <Layer isOpen={resources.addItemMode ? resources.addItemMode.mode : false} label="Add New Item Dialog">
          <ItemForm
            initialValues={{ available_material_types: materialTypes, available_loan_types: loanTypes, status: { name: 'Available' }, instanceId: 'dummy' }}
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
