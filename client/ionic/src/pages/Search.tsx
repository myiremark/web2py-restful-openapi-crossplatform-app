import React, {Component} from 'react';
import {IonPage, IonContent, IonGrid, IonRow, IonCol} from '@ionic/react';

import {
  SearchkitManager,
  SearchkitProvider,
  SearchBox,
  Pagination,
  HitsStats,
  SortingSelector,
  NoHits,
  ResetFilters,
  ViewSwitcherToggle,
  GroupedSelectedFilters,
  Layout,
  TopBar,
  LayoutBody,
  LayoutResults,
  ActionBar,
  ActionBarRow,
  Hits,
  TagCloud,
  RangeFilter,
  MenuFilter,
  ItemHistogramList,
} from 'searchkit';

import {PageSizeSelector, Toggle} from 'searchkit';

import 'searchkit/theming/theme.scss';
import '../theme/search.css';

import MetaHitsListItem from '../components/Search/HitsListItem';

import API from '../api';

import {searchSortingConfig} from '../constants';
import {Header} from '../components/Header';

const host = API.searchEndpoint();

const searchkit = new SearchkitManager(host);

class Search extends Component {
  render() {
    return (
      <IonPage>
        <Header></Header>
        <IonContent>
          <SearchkitProvider searchkit={searchkit}>
            <Layout>
              <TopBar>
                <SearchBox
                  autofocus={true}
                  searchOnChange={true}
                  prefixQueryFields={['title^1', 'description^1', 'tags^1']}
                />
              </TopBar>
              <LayoutBody>
                <LayoutResults>
                  <IonGrid>
                    <IonRow>
                      <IonCol size="3" size-md>
                        <MenuFilter
                          field={'category.keyword'}
                          title="Category"
                          id="histogram-list"
                          listComponent={ItemHistogramList}
                        />
                      </IonCol>
                      <IonCol size="3" size-md>
                        <MenuFilter
                          field={'tags.keyword'}
                          title="Tags"
                          id="tagsFilter"
                          listComponent={TagCloud}
                        />
                      </IonCol>
                      <IonCol size="6" size-md>
                        <RangeFilter
                          min={0}
                          max={10000}
                          field="availableQuantity"
                          id="availableQuantity"
                          title="Available Quantity"
                          showHistogram={true}
                        />
                      </IonCol>
                    </IonRow>
                  </IonGrid>
                  <ActionBar>
                    <ActionBarRow>
                      <HitsStats
                        translations={{
                          'hitstats.results_found': '{hitCount} results found',
                        }}
                      />
                      <PageSizeSelector
                        options={[10, 25, 50, 100]}
                        listComponent={Toggle}
                      />
                      <ViewSwitcherToggle />
                      <SortingSelector options={searchSortingConfig} />
                    </ActionBarRow>
                    <ActionBarRow>
                      <GroupedSelectedFilters />
                      <ResetFilters />
                    </ActionBarRow>
                  </ActionBar>
                  <Hits
                    hitsPerPage={10}
                    highlightFields={['title', 'description', 'tags']}
                    sourceFilter={['title', 'tags', 'description']}
                    mod="sk-hits-list"
                    itemComponent={MetaHitsListItem}
                    scrollTo="body"
                  />
                  <NoHits suggestionsField={'title'} />
                  <Pagination showNumbers={true} />
                </LayoutResults>
              </LayoutBody>
            </Layout>
          </SearchkitProvider>
        </IonContent>
      </IonPage>
    );
  }
}

export default Search;
