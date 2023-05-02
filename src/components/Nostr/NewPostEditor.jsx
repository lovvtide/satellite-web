import React, { PureComponent } from 'react';

import Author from './Author';
import Editor from './Editor';


class NewPostEditor extends PureComponent {

	handlePost = async (post, replyTo, attached) => {

		await this.props.handlePost(post, null, attached);

		if (this.props.onResolve) {

			this.props.onResolve();
		}
	};

	render = () => {

		const { author } = this.props;

		return (
			<div style={this.props.style}>
				<Author
					highlight={this.props.highlight}
					pubkey={author.pubkey}
					name={author.name}
					displayName={author.display_name}
					about={author.about}
					nip05={author.nip05}
					picture={author.picture}
					imageStyle={{
						height: 32,
						width: 32
					}}
				/>
				<Editor
					style={{ marginTop: 12, ...(this.props.editorStyle || {}) }}
					rows={3}
					id={this.props.editorId || 'compose_new_editor'}
					placeholder='Say something . . .'
					onCancel={this.props.onCancel}
					handlePost={this.handlePost}
					handleQueryProfiles={this.props.handleQueryProfiles}
					searchActive={this.props.searchActive}
					showCancel
					searchStyle={this.props.modal ? {
						position: 'absolute',
						width: 512
					} : undefined}
				/>
			</div>
		);
	};
}

export default NewPostEditor;
