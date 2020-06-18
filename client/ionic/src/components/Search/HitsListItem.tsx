import React from 'react';
import extend from 'lodash/extend';

import {HitItemProps} from 'searchkit/lib/components/search/hits/src/Hits';
import {TagFilterList} from 'searchkit';

import AppRoutes from '../../routes';

const HitsListItem = (props: HitItemProps) => {
  const {bemBlocks, result} = props;
  const url = AppRoutes.entityViewByType("inventoryItem",result._id);
  const source = extend({}, result._source, result.highlight);
  return (
    <div
      className={bemBlocks.item().mix(bemBlocks.container('item'))}
      data-qa="hit"
    >
      <div className={bemBlocks.item('details')}>
        <a href={url}>
          <h2
            className={bemBlocks.item('title')}
            dangerouslySetInnerHTML={{__html: source.title}}
          ></h2>
        </a>
        <div
          className={bemBlocks.item('text')}
          dangerouslySetInnerHTML={{__html: source.description}}
        ></div>
        <div
          className={bemBlocks.item('text')}
        >Tags:{' '}<TagFilterList field="tags.raw" values={result._source.tags} />
        </div>
      </div>
    </div>
  );
};

export default HitsListItem;
