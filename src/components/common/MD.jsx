import React, { Component } from 'react';
import { connect } from 'react-redux';
import { nip19 } from 'nostr-tools';
import marked from 'marked';
import DOMPurify from 'dompurify';

import { COLORS, EDITOR_LINE_HEIGHT } from '../../constants';
import { navigate } from '../../actions';


const transform = (props) => {

	const r = new marked.Renderer();
	const { comment, bio } = props;

	const stylize = (attrs) => {
		let s = '';
		for (let attr of Object.keys(attrs)) {
			s += `${attr}:${attrs[attr]};`;
		}
		return `style="${s}"`;
	};

	const paragraph = (text) => {
		return `<div ${stylize({
			'margin-bottom': comment ? '4px' : '12px',
			'-webkit-font-smoothing': 'antialiased',
			'color': 'rgba(255,255,255,0.85)',
			'font-family': 'Lexend-Deca-Regular',
			'font-size': bio ? '14px' : (comment ? '14px' : '16px'),
			'line-height': comment ? `21px` : `${EDITOR_LINE_HEIGHT}px`,
			...(props.paragraphStyle || {})
		})}>${text}</div>`;
	};

	r.heading = comment ? paragraph : (text, level) => {

		// Don't render title or subtitle directly
		if (level === 1 || level === 6) { return ''; }
		const fontSize = { '3': 28,'4': 22 }; // hlarge and hsmall
		const lineHeight = { '3': 34,'4': 28 }
		return `<div ${stylize({
			'margin-top': '24px',
			'-webkit-font-smoothing': 'antialiased',
			'font-size': `${fontSize[level]}px`,
			'line-height': `${lineHeight[level]}px`,
			'margin-bottom': '8px',
			'color': '#fff'
		})}>${text}</div>`;
	};

	r.hr = comment ? () => { return paragraph('---'); } : () => {
		const base = `font-size:28px`;
		return `
			<div style="padding:8px 8px 0px 8px;text-align:center;margin-top:28px;margin-bottom:24px">
				<span style="${base};margin-right:24px">*</span>
				<span style="${base}">*</span>
				<span style="${base};margin-left:24px">*</span>
			</div>
		`;
	};

	r.blockquote = (text) => {
		return `<div ${stylize({
			'margin-left': comment ? '0px' : '9px',
			'font-style': 'italic',
			'margin-bottom': comment ? '4px' : '16px',
			'margin-top': comment ? '4px' : '16px',
			'padding-left': comment ? '4px' : '12px',
			'padding-right': comment ? '4px' : '24px',
			'opacity': comment ? 0.6 : 1,
			'color': comment ? 'rgba(255,255,255,0.54)' : 'rgba(255,255,255,0.9)',
			'border-left': comment ? 'none' : '3px solid rgb(47, 54, 61)'
		})}>${text}</div>`;
	};

	r.paragraph = paragraph;

	r.link = (href, title, text) => {

		if (href.indexOf('mailto:') === 0) { return text; }

		const link = `<a class="mdlink" foo="bar" rel="noopener" title="${text}" ${stylize({
			'color': '#fff',
			'text-decoration': 'underline',
			...(props.linkStyle || {})
		})} href="${href}" target="_blank">${text}</a>`;

		let _image, _video, _audio, _tag;

		if (props.showImagePreviews && props.scriptContextId) {

			let ext = href.slice(href.lastIndexOf('.') + 1);

			if (ext.indexOf('&') !== -1) {
				ext = ext.split('&')[0];
			}

			const previewImage = [ 'jpeg', 'jpg', 'png', 'webp', 'gif' ];
			const previewVideo = props.showFullsizeMedia ? [ 'mp4' ] : [];
			const previewAudio = []/*[ 'mp3' ]*/;
			
			// _preview = ([
			// 	...previewImage,
			// 	...previewVideo,
			// 	...previewAudio
			// ]).indexOf(ext) !== -1;

			if (previewImage.indexOf(ext) !== -1) {
				_image = true;
				_tag = 'img';
			} else if (previewVideo.indexOf(ext) !== -1) {
				_video = true;
				_tag = 'video';
			} else if (previewAudio.indexOf(ext) !== -1) {
				_audio = true;
				_tag = 'audio';
			}
		}

		if (_image) {

			if (props.showFullsizeMedia) {

				return `<img id="${`${props.scriptContextId}_${href}`}" class="${props.scriptContextId}" src=${href} ${stylize({
					//'cursor': 'pointer',
					'height': 'auto',
					'width': '100%',
					'margin-top': '6px',
					//'margin-bottom': '12px',
					'margin-right': '12px',
					//'border': `1px solid ${COLORS.secondary}`,
					'padding': '1px',
					'border-radius': '4px'
				})}/>`;

			} else {

				return `<div ${stylize({
					'display': 'flex',
					'align-items': 'center',
					'margin-top': '12px',
					'margin-bottom': '0px'
				})}><img id="${`${props.scriptContextId}_${href}`}" class="${props.scriptContextId}" src=${href} ${stylize({
					'cursor': 'pointer',
					'height': '48px',
					'width': 'auto',
					'margin-right': '12px',
					'border': `1px solid ${COLORS.secondary}`,
					'padding': '1px',
					'border-radius': '4px'
				})} /><div ${stylize({
					'display': '-webkit-box',
					'-webkit-line-clamp': 2,
					'-webkit-box-orient': 'vertical',
					'overflow': 'hidden'
				})}>${link}</div></div>`;
			}

		} else if (_video) {

			return `<video controls src=${href} ${stylize({
				'cursor': 'pointer',
				'height': 'auto',
				'width': '100%',
				'margin-top': '6px',
				//'margin-bottom': '12px',
				'margin-right': '12px',
				//'border': `1px solid ${COLORS.secondary}`,
				'padding': '1px',
				'border-radius': '4px'
			})}></video>`;

		} else if (/*audio*/false) {

			// support audio

			return;
		}

		return link;
	};

	r.image = (href, title, text) => {
		return r.link(href, title, text || 'image');
	};

	r.code = (text) => {

		return r.paragraph(text);

		// return `<pre ${stylize({
		// 	'background': 'rgb(47, 54, 61, 0.75)',
		// 	'padding': '12px',
		// 	'overflow-x': 'scroll'
		// })}>${text}</pre>`;
	};

	return r;
};

const insertAtReferences = (s) => {

	const charset = 'abcdefghijklmnopqrstuvwxyz0123456789-_';
	const n = s.length;
	let r = [];

	for (let i = 0; i < n; i++) {

		if (s[i] === '@' && s[i - 1] !== '/' && (s[i - 1] === ' ' || /*s[i - 1] ||*/ s[i - 1] === '(' || typeof s[i - 1] === 'undefined' || s[i - 1] === '>')) {

			for (let j = i + 1; j < n; j++) {

				if (s[j] !== '@' && (charset.indexOf(s[j]) === -1 || j === n - 1)) {

					if (j > i) { r.push([ i, j ]); }

					break;
				}
			}
		}
	}

	if (r.length > 0) {

		let _s = '';
		let _i = 0;
		let _v;

		for (let x of r) {

			_s += s.substring(_i, x[0]);
			_v = s.substring(x[0], x[1]);
			_s += _v.indexOf('@') !== _v.lastIndexOf('@') ? _v : `<a href="https://satellite.earth/${_v}" style="color:#fff;text-decoration:underline;" title="${_v}" class="mdlink">${_v}</a>`;
			_i = x[1];
		}

		_s += s.substring(_i, n);

		return _s;
	}

	return s;
};

const insertMentions = (s, tags = [], mentions = {}, context) => {

	if (tags.length === 0 && s.indexOf('nostr:') === -1) { return s; }

	let awaitingMetadata = false;

	const segments = [];

	let last = 0;

	// Parse and insert mentions according to the old way
	for (let i = 0; i < s.length; i++) {

		// Detected start of mention
		if (s[i] === '#' && s[i + 1] === '[') {

			// Start looking at chars after open bracket
			for (let j = i + 2; j < s.length; j++) {

				// If closed bracket is found
				if (s[j] === ']') {

					const ordinal = s.slice(i + 2, j);
					const number = parseInt(ordinal);
					const start = i;

					if (isNaN(number)) { break; }

					const tag = tags[number];

					if (!tag) { continue; }

					if (tag[0] === 'p') {

						const tag = tags[number];
						const pubkey = tag[1];
						let profile = {};

						if (mentions[pubkey] && mentions[pubkey].profile) {
							profile = mentions[pubkey].profile;
						} else {
							awaitingMetadata = true;
						}

						const npub = nip19.npubEncode(pubkey); 
						const name = profile.display_name || profile.name || (npub.slice(0, 8) + '...' + npub.slice(-4));

						segments.push(`${s.slice(last, start)}<a href="${`https://satellite.earth/@${npub}`}" style="font-weight:bold;color:#fff;cursor:pointer" class="mention">@${name}</a>`);

					} else if (tag[0] === 'e') {

						segments.push(`${s.slice(last, start)}<a href="${`https://satellite.earth/thread/${nip19.noteEncode(tag[1])}`}" style="font-weight:bold;color:#fff;cursor:pointer" class="mention">#note</a>`);
					}

					//context.mention = true;
					last = j + 1;
					break;
				}
			}
		}
	}

	// Push the remainder segment
	segments.push(s.slice(last, s.length));

	const ss = segments.join('');

	// if (ss.indexOf('nostr:') === -1) {

	// 	return ss;
	// }

	// Parse and insert mentions according to NIP-27
	const _ss = ss.split('nostr:');

	const __ss = [];

	for (let segment of _ss) {

		//const r = segment.split(' ')[0];

		//let r;
		let decoded;
		let replaced = '';
		// let splitIndex = -1;

		// if (segment.indexOf(' ') !== -1) {
		// 	splitIndex = segment.indexOf(' ');
		// }

		// if (segment.indexOf('\n') < splitIndex) {
		// 	splitIndex = segment.indexOf('\n');
		// }

		// if (splitIndex > -1) {

		// 	r = segment.substring(0, splitIndex);
		// }

		if (segment.indexOf('npub1') === 0 || segment.indexOf('note1') === 0) {

			const parsed = segment.substring(0, 63);

			try {

				decoded = nip19.decode(parsed);

			} catch (err) {
				//continue;
			}

			if (decoded) {

				if (decoded.type === 'npub') {

					let profile = {};

					if (mentions[decoded.data] && mentions[decoded.data].profile) {
						profile = mentions[decoded.data].profile;
					} else {
						awaitingMetadata = true;
					}

					const name = profile.display_name || profile.name || (parsed.slice(0, 8) + '...' + parsed.slice(-4));

					replaced = `<a href="${`https://satellite.earth/@${parsed}`}" style="font-weight:bold;color:#fff;cursor:pointer" class="mention">@${name}</a>` + segment.slice(63);

				} else if (decoded.type === 'note') {

					replaced = `<a href="${`https://satellite.earth/thread/${parsed}`}" style="font-weight:bold;color:#fff;cursor:pointer" class="mention">#note</a>` + segment.slice(63);
				}
			}
		}

		__ss.push(replaced || segment);

		// if (replaced) {

		// 	__ss.push(replaced);
		// 	//__ss.push(segment.slice(63));

		// } else {

		// 	__ss.push(segment);
		// }

		// __ss.push(replaced ? segment.slice(63) : segment);

		// if (replaced) {

		// 	__ss.push(replaced);
		// }

	}

	context.awaitingMetadata = awaitingMetadata;

	return __ss.join('');
};


class MD extends Component {

	constructor (props) {
		super(props);
		this._container = React.createRef();
		this.__html = '';
	}

	shouldComponentUpdate = (nextProps) => {

		if (Object.keys(this.props.mentions || {}).length !== Object.keys(nextProps.mentions || {}).length) {
			return true;
		}

		if (!this.props.dynamic) { return false; }

		return this.props.markdown !== nextProps.markdown;
	};
	
	// When the component mounts, replace links to other
	// locations on satellite with react-router action
	componentDidMount = () => {

		//window._md[]

		this.attachMentionHandlers(this._container.current.children);

		if (this.props.attachMediaPreviewListeners) {
			this.props.attachMediaPreviewListeners();
		}

		//setInterval(() => { this.forceUpdate(); }, 1000);
	};

	componentWillUnmount = () => {

		clearTimeout(this._pendingPostUpdate);
		delete this.__html;
	};

	componentDidUpdate = () => {

		// this.attachMentionHandlers(this._container.current.children);

		// if (this.props.attachMediaPreviewListeners) {
		// 	this.props.attachMediaPreviewListeners();
		// }

		if (!this.pendingPostUpdate) {

			this.pendingPostUpdate = true;

			this._pendingPostUpdate = setTimeout(() => {

				this.pendingPostUpdate = false;

				this.attachMentionHandlers(this._container.current.children);

				if (this.props.attachMediaPreviewListeners) {
					this.props.attachMediaPreviewListeners();
				}

			}, 500);
		}
	};

	attachMentionHandlers = (node) => {

		if ((this.props.tags || []).length === 0) { return; }

		for (let child of node) {
			if (child.className === 'mention') {
				//if (child.onclick) { continue; }
				if (child.href.indexOf('https://satellite.earth') !== -1) {
					const _link = child.href.split('https://satellite.earth');
					const path = _link[1] === '' ? '/' : _link[1];
					child.onclick = (e) => {
						e.preventDefault();
						this.props.navigate(path);
					};
				}

				// child.onclick = (e) => {
				// 	e.preventDefault();
				// 	this.props.navigate(`/@${e.target.attributes.name.value}`);
				// };

				/*
				if (this.props.handleMentionMouseOver) {
					child.onmouseover = (e) => {
						e.preventDefault();
						this.props.handleMentionMouseOver(child);
					};
				}

				if (this.props.handleMentionMouseOut) {
					child.onmouseout = (e) => {
						e.preventDefault();
						this.props.handleMentionMouseOut(child);
					};
				}
				*/

				// if (child.href.indexOf('https://satellite.earth') !== -1) {
				// 	const _link = child.href.split('https://satellite.earth');
				// 	const path = _link[1] === '' ? '/' : _link[1];
				// 	child.onclick = (e) => {
				// 		e.preventDefault();
				// 		this.props.navigate(path);
				// 	};
				// }

			} else {
				this.attachMentionHandlers(child.children);
			}
		}
	};

	render = () => {

		if (!this.__html || this.awaitingMetadata/* Object.keys(this.props.mentions).length > 0*/) {

			let markdown = this.props.markdown;

			if (this.props.comment) {

				markdown = markdown.trim();

				//markdown = markdown.replace(/\n\n\n+/g, '\n---\n');
			}

			if (typeof markdown === 'undefined' || markdown === null) { markdown = ''; }

			// Disable parsing certain items
			const lexer = new marked.Lexer();

			for (let item of [ 'code', 'list', 'listitem', 'html', 'checkbox', 'table', 'tablerow', 'tablecell', ...(this.props.exclude || []) ]) {
				lexer.rules[item] = { exec: function() {} };
			}

			// Setup the parsing engine with custom rules,
			// render to HTML and sanitize to prevent XSS
			marked.setOptions({ lexer, renderer: transform(this.props), gfm: true, breaks: false });

			// Generate html from markdown string
			let __html = marked(markdown);

			/*
			// Replace "@" references to users with link tag
			__html = insertAtReferences(__html);
			*/

			__html = insertMentions(__html, this.props.tags, this.props.mentions, this);

			// Make sure html is safe to inject
			this.__html = DOMPurify.sanitize(__html, { ADD_ATTR: [ 'target', 'onmouseover' ] });
		}

		return (
			<div
				ref={this._container}
				dangerouslySetInnerHTML={{ __html: this.__html }}
				style={{
					overflowWrap: 'break-word',
					...(this.props.lineClamp ? {
						display: '-webkit-box',
						WebkitLineClamp: this.props.lineClamp,
						WebkitBoxOrient: 'vertical',
						overflow: 'hidden'
					} : {}),
					...(this.props.style || {})
				}}
			/>
		);
	};
};

export default connect(null, { navigate })(MD);
