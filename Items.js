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
import makePathFunction from '@folio/stripes-components/util/makePathFunction';

import ItemForm from './ItemForm';
import ViewItem from './ViewItem';

const filterConfig = [
  {
    label: 'Item Types',
    name: 'item',
    cql: 'materialType',
    values: [
      { name: 'Books', cql: 'Book' },
      { name: 'DVDs', cql: 'DVD' },
      'Microfilm',
    ],
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
      path: makePathFunction(
        'inventory/items',
        'materialType=*',
        'materialType="$QUERY" or barcode="$QUERY*" or title="$QUERY*"',
        { 'Material Type': 'materialType' },
        filterConfig,
      ),
      staticFallback: { path: 'inventory/items' },
    },
    materialTypes: {
      type: 'okapi',
      path: 'material-type',
      records: 'mtypes',
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

    this.connectedViewItem = props.stripes.connect(ViewItem);
    const logger = props.stripes.logger;
    this.log = logger.log.bind(logger);
  }

  componentWillMount() {
    if (_.isEmpty(this.props.data.addItemMode)) this.props.mutator.addItemMode.replace({ mode: false });
  }

  onClearSearch() {
    this.log('action', 'cleared search');
    this.setState({ searchTerm: '' });
    this.props.history.push(this.props.location.pathname);
  }

  onSort(e, meta) {
    const sortOrder = meta.name;
    this.log('action', `sorted by ${sortOrder}`);
    this.setState({ sortOrder });
    this.transitionToParams({ sort: sortOrder });
  }

  onSelectRow(e, meta) {
    const itemId = meta.id;
    this.log('action', `clicked ${itemId}, selected item =`, meta);
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
    this.log('action', `searched for '${query}'`);
    this.transitionToParams({ query });
  }

  updateFilters(filters) { // provided for onChangeFilter
    this.transitionToParams({ filters: Object.keys(filters).filter(key => filters[key]).join(',') });
  }

  create(data) {
    // POST item record
    this.log('action', `Creating new item record: ${JSON.stringify(data)}`);
    this.props.mutator.items.POST(data);
    this.onClickCloseNewItem();
  }

  render() {
    const { data } = this.props;
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
          defaultWidth="40%"
          paneTitle={
            <div style={{ textAlign: 'center' }}>
              <strong>Results</strong>
              <div>
                <em>{items.length} Result{items.length === 1 ? '' : 's'} Found</em>
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
            fullWidth
            sortOrder={this.state.sortOrder}
            isEmptyMessage={`No results found for "${this.state.searchTerm}". Please check your spelling and filters.`}
          />
        </Pane>

        {/* Details Pane */}
        <Route path={`${this.props.match.path}/view/:itemid`} render={props => <this.connectedViewItem {...props} />} />
        <Layer isOpen={data.addItemMode ? data.addItemMode.mode : false} label="Add New Item Dialog">
          <ItemForm
            initialValues={{ available_material_types: this.props.data.materialTypes }}
            onSubmit={(record) => { this.create(record); }}
            onCancel={this.onClickCloseNewItem}
          />
        </Layer>
      </Paneset>
    );
  }
}

export default Items;
