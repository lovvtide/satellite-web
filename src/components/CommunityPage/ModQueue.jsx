import React, { PureComponent } from 'react';
import { Link } from 'react-router-dom';

import Post from './Post';

import { getLocalPrivateKey } from '../../actions';
import { COLORS } from '../../constants';


class ModQueue extends PureComponent {

	// componentDidMount = () => {
	// 	window.scrollTo({ top: 0 });
	// };

	render = () => {

		const { items } = this.props;

		if (items === null) {
			return null; // TODO loading animation
		}

		return (
			<div style={{
				paddingBottom: 196
			}}>
				{items.map((item, index) => {
					return (
						<Post
							key={item.event.id}
							event={item.event}
							base={`/n/${this.props.name}/${this.props.ownernpub}`}
							handleApprove={() => this.props.handleApprovePost(item)}
							moderator={this.props.moderator}
							profile={this.props.metadata[item.event.pubkey]}
						/>
					);
				})}
			</div>
		);
	};
}

export default ModQueue;
