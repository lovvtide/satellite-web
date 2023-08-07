import React, { PureComponent } from 'react';

import { LazyList } from '../CommonUI';
import Item from './Item';

import svgtransmit from '../../assets/transmit.svg';
import { COLORS } from '../../constants';
import { transition } from '../../helpers';

/* Render a feed of nostr items */

class Feed extends PureComponent {

	state = { items: null, recent: 0, hover: '', _blink: false, visible: true };

	componentDidMount = () => {

		this.registerObserver();

		this._blink = setInterval(() => {

			this.setState({ _blink: false });

			if (!this.state.recent) { return; }

			this.__blink = setTimeout(() => {
				this.setState({ _blink: true });
			}, 333);
			
		}, 1333);
	}

	// Close all subscriptions before unmounting
	componentWillUnmount = () => {

		clearInterval(this._blink);
		clearTimeout(this.__blink);

		if (this.feed && !this.props.maintainSubscription) {

			// TODO maybe don't actually unsubscribe automatically

			this.feed.unsubscribe();
		}
	};

	componentDidUpdate = (prevProps) => {

		if (this.props.listMode !== prevProps.listMode || prevProps.surface !== this.props.surface) {

			this.setState({ visible: false });

			this.props.feed.unregisterObserver(`frontpage_primary_${prevProps.listMode}`);

			this.registerObserver();
		}
	};

	registerObserver = () => {

		let buildOptions = this.props.buildOptions;

		if (!buildOptions && this.props.thread) {

			buildOptions = {
				mode: 'list',
				label: this.props.listMode,
				surface: this.props.surface,
			};
		}

		this.props.feed.registerObserver(this.props.name, this.handleUpdate, buildOptions);
	};

	handleUpdate = (items) => {

		if (!items) { return; }

		let recent = 0;

		for (let item of items) {

			if (!item.eroot && item.recent === this.props.name) {
				recent++;
			}
		}

		this.setState({ items, recent, visible: true });
	};

	handleLoadMore = () => {

		this.props.handleLoadMore();

		this.setState({ hover: '' });
	};

	handleLoadRecent = () => {

		this.setState({ recent: 0 });

		window.client.loadRecent(
			this.props.feed,
			this.props.name,
			{ listMode: this.props.listMode }
		);
	};

	renderItems = () => {

		const { mobile, active, highlight, divided, name} = this.props;
		const { items } = this.state;

		if (!items) { return null; }

		const rendered = items.map((item, index) => {

			return (
				<Item
					key={item.event.id}
					_mod={this.props.feed._mod}
					depth={0}
					topLevel
					index={index}
					mobile={mobile}
					active={active}
					searchActive={this.props.searchActive}
					profile={this.props.profile}
					event={item.event}
					eroot={item.eroot}
					replies={item.replies}
					deleted={item.deleted}
					phantom={item.phantom}
					repost={item._repost}
					upvotes={item.upvotes}
					highlight={highlight}
					divided={divided}
					thread={this.props.thread}
					list_n={item.list_n}
					list_p={item.list_p}
					list_t={item.list_t}
					handlePost={this.props.handlePost}
					handleMobileReply={this.props.handleMobileReply}
					handleSelectThread={this.props.handleSelectThread}
					handleQueryProfiles={this.props.handleQueryProfiles}
					handleZapRequest={this.props.handleZapRequest}
					handleFollow={this.props.handleFollow}
					selected={item.event.id === this.props.selected}
					recent={name && name === item.recent}
					navigate={this.props.navigate}
					contacts={this.props.contacts || {}}
					author={item.author}
					feedName={this.props.name}
					metadata={this.props.feed.metadata}
					//metadataCount={Object.keys(this.props.feed.metadata).length}
					showFullsizeMedia={this.props.profile && (this.props.profile === item.event.pubkey || item._repost || (item.upvotes && item.upvotes[this.props.profile]))}
					replaceTitle={item.event.id === this.props.replaceTitle}
					items={this.props.feed.items}
					feedPostId={(this.props.buildOptions || {}).id}
					previewReplacedLinks={this.props.previewReplacedLinks}
					notificationsLastSeen={this.props.notificationsLastSeen}
				/>
			);
		});

		return this.props.lazyRender ? (
			<LazyList
				onUpdateLimit={this.props.onUpdateLazyFeedLimit}
				overflowContainer={this.props.overflowContainer || window}
				renderInit={this.props.lazyRenderInit}
				renderBatch={this.props.lazyRenderBatch || 20}
				offsetLead={1000}
			>
				{rendered}
			</LazyList>
		) : (
			<div>
				{rendered}
			</div>
		);
	}

	renderLoadRecent = () => {

		return null; // TODO fix recent indicator

		const { recent, _blink } = this.state;

		return (
			<div
				style={styles.loadRecent(this.state)}
			>
				<div
					onMouseOver={() => this.setState({ hover: 'load_recent' })}
					onMouseOut={() => this.setState({ hover: '' })}
					onClick={recent ? this.handleLoadRecent : null}
					style={{ opacity: recent ? 1 : 0, display: 'flex', alignItems: 'center', padding: 6, cursor: recent ? 'pointer' : 'default' }}
				>
					<img
						style={{ marginRight: 8, opacity: _blink ? 1 : 0 }}
						src={svgtransmit}
						height={18}
						width={18}
					/>
					<div
						style={{ height: 19 }}
					>
						LOAD {recent} NEW {recent > 1 ? 'THREADS' : 'THREAD'}
					</div>
				</div>
			</div>
		);

	};

	renderLoadMore = () => {

		const { hover, items } = this.state;
		const hidden = this.props.loadMorePending || !items || items.length === 0;

		if (!this.props.handleLoadMore) { return null; }

		return (
			<div
				style={{
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					paddingTop: 16,
					opacity: hidden ? 0 : 1,
					pointerEvents: hidden ? 'none' : 'auto',
					...transition(0.2, 'ease', [ 'opacity' ])
				}}
			>
				<div
					style={{
						fontFamily: 'JetBrains-Mono-Regular',
						border: `1px solid ${COLORS.secondary}`,
						padding: '4px 8px',
						fontSize: 12,
						cursor: 'pointer',
						userSelect: 'none',
						color: hover === 'load' ? '#fff' : COLORS.secondaryBright,
						...transition(0.2, 'ease', [ 'color' ])
					}}
					onMouseOver={() => this.setState({ hover: 'load' })}
					onMouseOut={() => this.setState({ hover: '' })}
					onClick={this.handleLoadMore}
				>
					LOAD OLDER THREADS
				</div>
			</div>
		);
	};

	render = () => {

		return (
			<div style={styles.container(this.props, this.state)}>
				{this.renderLoadRecent()}
				{this.renderItems()}
				{this.renderLoadMore()}
			</div>
		);
	}
}

const styles = {

	loadRecent: ({ recent, hover }) => {
		return {
			userSelect: 'none',
			fontSize: 12,
			height: recent ? 48 : 0,
			opacity: recent ? (hover === 'load_recent' ? 1 : 0.85) : 0,
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'center',
			fontFamily: 'JetBrains-Mono-Regular',
			...transition(0.2, 'ease', [ 'opacity', 'height' ])
		};
	},

	container: ({ style }, { visible }) => {
		return {
			color: '#fff',
			opacity: visible ? 1 : 0,
			...(visible ? transition(0.2, 'ease', [ 'opacity' ]) : {}),
			...(style || {})
		};
	}
};

export default Feed;
