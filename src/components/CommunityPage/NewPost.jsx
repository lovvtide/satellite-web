import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { nip19 } from 'nostr-tools';

import Editor from '../Nostr/Editor';

import { queryProfiles, getLocalPrivateKey, navigate } from '../../actions';
import { COLORS } from '../../constants';


class NewPost extends PureComponent {

	state = { title: '', link: '', error: '' };

	handlePost = async (post) => {

		const { title, link } = this.state;

		if (!title) {

			this.setState({
				error: 'Title is required'
			});

			return;
		}

		const data = {
			kind: 1,
			tags: [
				[ 'a', `34550:${this.props.ownerpubkey}:${this.props.name}` ]
			]
		};

		let quoted, nnote, noteid;

		if (link) {

			data.tags.push([ 'r', link ]);

			const nindex = link.indexOf('note1');

			if (nindex !== -1) {

				nnote = link.substring(nindex, nindex + 63);

				if (nnote.length === 63) {

					try {

						const decoded = nip19.decode(nnote);
						noteid = decoded.data;
						quoted = true;

					} catch (err) {
						console.log(err);
					}
				}
			}
		}

		if (quoted) {

			data.content = ([ post.content, `nostr:${nnote}` ]).join(`\n\n`).trim();
			data.tags.push([ 'q', noteid ]);

		} else if (link) {

			data.content = ([ link, post.content ]).join(`\n\n`).trim();

		} else {

			data.content = post.content;
		}

		if (title) {

			data.content = `${title}\n\n${data.content}`;
			data.tags.push([ 'subject', title ]);
		}

		data.content = data.content.trim();

		window.client.populateMentionTags(data.tags, data.content);

		let event, ok;

		try {

			event = await window.client.createEvent(data, {
				privateKey: getLocalPrivateKey()
			});

		} catch (err) {
			console.log(err);
		}

		if (!event) { return; }

		this.props.feed.update(event, null, { newpub: true });

		try {

			await new Promise((resolve, reject) => {
				window.client.publishEvent(event, (status, relay) => {
					if (status === 'ok' || status === 'seen') {
						resolve();
					} else if (status === 'failed') {
						//reject();
					}
				});
			});

			ok = true;

		} catch (err) {
			console.log(err);
		}

		if (ok) {

			this.props.navigate(`/n/${this.props.name}/${this.props.ownernpub}#post_success`);
			window.scrollTo({ top: 0 });
		}
	};

	handleTitleChange = (e) => {
		const { value } = e.target;
		const title = value.length > 300 ? value.substring(0, 300) : value;
		this.setState({ title, error: '' });
	};

	handleLinkChange = (e) => {
		const { value } = e.target;
		this.setState({ link: value });
	};

	render = () => {

		return (
			<div style={{
				maxWidth: 612,
				paddingTop: 22
			}}>
				<div style={{
					marginBottom: 24
				}}>
					<div style={{
						fontSize: 16,
						marginBottom: 6,
						fontWeight: 'bold'
					}}>
						Submit New Post
					</div>
					<div style={{ color: 'rgba(255,255,255,0.85)', fontSize: 13 }}>
						Please ensure that your post is in accordance with the rules of this community.
					</div>
				</div>
				<div style={{
					marginBottom: 196
				}}>
					<div style={{
						paddingLeft: this.props.mobile ? 0 : 24,
						borderLeft: this.props.mobile ? 'none' : `6px solid rgb(29, 30, 31)`
					}}>
						<div style={styles.label}>
							TITLE <span style={{ marginLeft: 3 }}>(REQUIRED)</span>
						</div>
						<input
							style={styles.input}
							value={this.state.title}
							onChange={this.handleTitleChange}
						/>
						<div style={styles.label}>
							LINK <span style={{ color: COLORS.secondaryBright, marginLeft: 3 }}>(OPTIONAL)</span>
						</div>
						<input
							style={styles.input}
							value={this.state.link} 
							onChange={this.handleLinkChange}
						/>
						<div style={styles.label}>
							TEXT <span style={{ color: COLORS.secondaryBright, marginLeft: 3 }}>(OPTIONAL)</span>
						</div>
						<Editor
							rows={5}
							id={'community_new_post'}
							handlePost={this.handlePost}
							handleQueryProfiles={this.props.queryProfiles}
							searchActive={this.props.searchActive}
							confirmText='SUBMIT'
							disableSendHighlight
							disableAutoFocus
							actionsStyle={{
								marginTop: 18
							}}
						/>
						{this.state.error ? (
							<div style={{
								color: COLORS.red,
								fontSize: 13
							}}>
								{this.state.error}
							</div>
						) : null}
					</div>
				</div>
			</div>
		);
	};
}

const mapState = ({ query, app }) => {

	return {
		searchActive: query.active,
		mobile: app.mobile
	};
};

const styles = {

	label: {
		fontSize: 12,
		textTransform: 'uppercase',
		marginBottom: 4,
		color: 'rgba(255,255,255,0.85)',
		fontWeight: 'bold'
	},

	input: {
		width: '100%',
    color: 'rgba(255, 255, 255, 0.85)',
    background: 'rgb(29, 30, 31)',
    borderRadius: 4,
    padding: '12px 13px',
    border: '1px dotted rgb(47, 54, 61)',
    outline: 'none',
    overflow: 'hidden',
    fontFamily: 'Lexend-Deca-Regular',
    marginBottom: 16
	}
};

export default connect(mapState, { queryProfiles, navigate })(NewPost);
