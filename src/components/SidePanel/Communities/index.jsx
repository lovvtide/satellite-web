import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { Icon } from 'semantic-ui-react';

//import EditProfileForm from '../Nostr/EditProfileForm';
//import { CanonicalValue } from '../CommonUI';

import Header from './Header';
import AdminEditor from './AdminEditor';
import ListItem from './ListItem';

import { transition } from '../../../helpers';
import { COLORS } from '../../../constants';
import { handleNostrPublish, navigate } from '../../../actions';
//import crownsvg from '../../../assets/crown.svg';


class Communities extends PureComponent {

	state = {
		createNew: false, // Create new mode
		editing: null // Community being edited
	};

	// renderProfileSection = () => {

	// 	return (
	// 		<div>
				
	// 		</div>
	// 		// <div style={styles.sectionContainer(this.props.mobile)}>
	// 		// 	<EditProfileForm
	// 		// 		clientWidth={this.props.clientWidth}
	// 		// 		clientHeight={this.props.clientHeight}
	// 		// 		handlePublish={handleNostrPublish}
	// 		// 		metadata={this.props.metadata}
	// 		// 		mobile={this.props.mobile}
	// 		// 	/>
	// 		// </div>
	// 	);
	// };

	// Toggle create new mode
	handleToggleEdit = (update) => {
		this.setState(update);
	};

	handlePublishCommunity = async (params) => {

		try {

			await handleNostrPublish({
				content: '',
				kind: 34550
			}, params);

			this.setState({
				createNew: false,
				editing: null
			});

		} catch (err) {
			console.log(err);
		}
	};

	renderHeader = () => {

		return (
			<div style={{
				height: 60,
				display: 'flex',
				alignItems: 'center'
			}}>
				<div>
					My Communities
				</div>
				<div>
					Create New
				</div>
			</div>
		);
	};

	renderAdminEditor = () => {

		const { createNew, editing } = this.state;
		const { mobile } = this.props;

		return createNew || editing ? (
			<div style={{
				paddingTop: mobile ? 84 : 24,
				paddingLeft: mobile ? 12 : 24,
				paddingRight: mobile ? 12 : 24
			}}>
				<AdminEditor
					handlePublishCommunity={this.handlePublishCommunity}
					pubkey={this.props.pubkey}
					createNew={createNew}
					editing={editing}
					mobile={mobile}
				/>
			</div>
		) : null;

	};

	renderList = () => {

		const { createNew, editing } = this.state;
		const { mobile } = this.props;

		if (createNew || editing) { return null; }

		return (
			<div style={{
				paddingTop: mobile ? 84 : 24,
				paddingLeft: mobile ? 12 : 24,
				paddingRight: mobile ? 12 : 24
			}}>
				{this.props.list.filter(item => {
					return item.founder || item.moderator;
				}).map(item => {
					return (
						<ListItem
							key={item.event.id}
							item={item}
							handleConfigClicked={() => this.setState({ editing: item })}
						/>
					);
				})}
			</div>
		);
	};

	render = () => {

		return (
			<div style={styles.settingsContainer(/*this.props.mobile, true, this.props.scrollHeight*/)}>
				<Header
					mobile={this.props.mobile}
					clientWidth={this.props.clientWidth}
					handleToggleEdit={this.handleToggleEdit}
					createNew={this.state.createNew}
					editing={this.state.editing}
				/>
				{this.renderAdminEditor()}
				{this.renderList()}
			</div>
		);
	};
}

const mapState = ({ app, nostr, communities }) => {
	return {
		clientHeight: app.clientHeight,
		clientWidth: app.clientWidth,
		scrollHeight: app.minHeight,
		mobile: app.mobile,
		pubkey: nostr.pubkey,
		list: communities.list
		//pubkey: nip19.npubEncode(nostr.pubkey),
		//privateKey: nostr.privateKey ? nip19.nsecEncode(nostr.privateKey) : undefined,
		//metadata: nostr.pubkey && nostr.metadata ? (nostr.metadata[nostr.pubkey] || {}) : {}/*(nostr.metadata || {})[nostr.pubkey] || {}*/
	};
};

const styles = {

	sectionContainer: (mobile) => {
		return {
			borderBottom: '1px solid #2f363d',
			whiteSpace: 'normal',
			padding: mobile ? 16 : 24
		};
	},

	sectionDescription: {
		color: 'rgba(255,255,255,0.85)',
		fontSize: 13
	},

	statusLabel: ({ color }) => {
		return {
			fontFamily: 'JetBrains-Mono-Regular',
			borderRadius: 3,
			marginLeft: 12,
			fontSize: 12,
			color
		};
	},
	
	sectionLabel: {
		textTransform: 'uppercase',
		fontFamily: 'JetBrains-Mono-Bold',
		fontSize: 12
	},

	sectionInfo: {
		marginTop: 16,
		lineHeight: '20px',
		fontSize: 13,
		color: COLORS.secondaryBright,
		whiteSpace: 'pre-wrap'
	},

	item: {
		fontSize: 12,
		marginTop: 12,
		display: 'flex',
		alignItems: 'center'
	},

	itemTitle: (mobile) => {
		return {
			fontWeight: 'bold',
			fontSize: 13
		};
	},

	itemDescription: {
		color: 'rgba(255,255,255,0.5)'
	},

	checkbox: (active) => {
		return {
			cursor: 'pointer',
			transform: 'scale(1.3)',
			marginRight: 12,
			opacity: active ? 1 : 0.5
		};
	},

	settingsContainer: (/*mobile, display, height*/) => {
		return {
			maxWidth: 612,
			// paddingLeft: mobile ? 12 : 24,
			// paddingRight: mobile ? 12 : 24,
			//height: mobile ? null : height,
			// paddingTop: mobile ? 72 : 24,
			paddingBottom: 96,
			color: '#fff',
			//marginTop: 1,
			//opacity: display ? 1 : 0,
			//...transition(0.2, 'ease', [ 'opacity' ])
		};
	}
};

export default connect(mapState, { navigate })(Communities);
