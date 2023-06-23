import { nip19 } from 'nostr-tools';


export default (props) => {

	const profile = props.profile || {};

	let name = profile.display_name || profile.displayName || profile.name;

	if (!name && (props.pubkey || props.npub)) {

		const encoded = props.npub ? props.npub : nip19.npubEncode(props.pubkey);
		name = encoded.slice(0, 8) + '...' + encoded.slice(-4);
	}

	return (
		<span style={props.style}>
			{name}
		</span>
	);
};
