import React, { PureComponent } from 'react';

import Post from './Post';


class List extends PureComponent {

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
							feed={this.props.feed}
							mobile={this.props.mobile}
							key={item.event.id}
							event={item.event}
							base={`/n/${this.props.name}/${this.props.ownernpub}`}
							approval={item.approval}
							metadata={this.props.metadata}
							//profile={this.props.metadata[item.event.pubkey]}
							profile={this.props.metadata[item.event.pubkey] ? (this.props.metadata[item.event.pubkey].profile) || {} : {}}
							searchActive={this.props.searchActive}
							handlePost={this.props.handlePost}
							handleMobileReply={this.props.handleMobileReply}
							handleSelectThread={this.props.handleSelectThread}
							handleQueryProfiles={this.props.handleQueryProfiles}
							handleZapRequest={this.props.handleZapRequest}
							handleFollow={this.props.handleFollow}
							navigate={this.props.navigate}
						/>
					);
				})}
			</div>
		);
	};
}

export default List;
