import React, { Component } from 'react';
import { connect } from 'react-redux';

import { X } from '../CommonUI';
import Modal from './Modal';
import NewPostEditor from './NewPostEditor';

import { setNewPostModalOpen, handleNostrPublish, queryProfiles } from '../../actions';
import svgtransmit from '../../assets/transmit.svg';
import { COLORS } from '../../constants';


class NewPostModal extends Component {

	componentDidMount = () => {

		this.editor = document.getElementById('compose_new_editor_modal');

		if (this.editor) {

			this.editor.focus();
		}
	};

	componentDidUpdate = (prevProps) => {

		if (this.props.open) {

			if (!prevProps.open) {

				document.body.style['overflow-y'] = 'hidden';
			}

		} else {

			if (prevProps.open) {

				document.body.style['overflow-y'] = 'auto';
			}
		}

	};

	handlePost = (post) => {

		handleNostrPublish(post);
	};

	handleClose = () => {

		this.props.setNewPostModalOpen(false);
	}

	render = () => {

		const { pubkey, open } = this.props;

		if (!open) { return null; }

		return (
			<Modal
				//fixed
				handleClose={this.handleClose}
				clientHeight={this.props.clientHeight}
				clientWidth={this.props.clientWidth}
				style={{
					padding: '96px 36px 96px',
					width: 587,
					transform: `translate(-50%, ${-1 * (this.props.clientHeight / 2)}px)`,
					top: '50%'
				}}
			>
				<NewPostEditor
					modal
					editorId='compose_new_editor_modal'
					searchActive={this.props.searchActive}
					handleQueryProfiles={this.props.queryProfiles}
					handlePost={this.handlePost}
					onCancel={this.handleClose}
					onResolve={this.handleClose}
					author={{
						pubkey,
						...(this.props.metadata[pubkey] || {})
					}}
				/>
			</Modal>
		);
	};
}

const mapState = ({ app, nostr, query }) => {

	return {
		open: app.newPostModalOpen,
		pubkey: nostr.pubkey,
		clientHeight: app.clientHeight,
		clientWidth: app.clientWidth,
		metadata: nostr.metadata || {},
		searchActive: query.active
	};
};

export default connect(mapState, { setNewPostModalOpen, queryProfiles })(NewPostModal);
