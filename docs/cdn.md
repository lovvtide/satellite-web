# Satellite CDN - Scalable Media Hosting for the Nostr Ecosystem

This service could be used by any nostr application to allow users to upload and serve files (including large files) from a fast content delivery network.

Satellite CDN is a paid service. Storage is "pay as you go" at a flat rate of USD $0.05 / GB / month, payable in sats via lightning at the current USD/BTC exchange rate. **Data transfer is free and unlimited.** This pricing structure is a good fit for social applications because users will not be charged extra if their content becomes popular. For example, if a nostr user uploads a 1 GB podcast to the CDN which goes viral and gets downloaded a million times, the user will still only pay a predictable rate of USD $0.05 per month.

For each file added to the CDN, Satellite computes the relevant [NIP-94](https://github.com/nostr-protocol/nips/blob/master/94.md) parameters and returns them to the client upon completion of the upload. The client may then verify these values and/or use them to create a kind `1063` event.


## Example

Let's go through a simple example demonstrating how to buy credit, fetch the user's account data, and upload a file using the API.


### Step 1: Obtain a lightning invoice to buy storage

```js
// Prompt user to sign a kind 22242 auth event
// requesting to buy 1 GB month of storage
const requestCredit = await window.nostr.signEvent({
  created_at: Math.ceil(Date.now() / 1000),
  content: 'Request Storage',
  kind: 22242,
  tags: [
    [ 'gb_months', '1' ]
  ]
});

// Send a GET request to the API with the signed event
// as the uri encoded auth param. The API responds with
// a json object which includes an offer to purchase the
// requested storage and expected terms of payment.
const service = await fetch(`https://api.satellite.earth/v1/media/account/credit?auth=${encodeURIComponent(JSON.stringify(requestCredit))}`);

// Prompt user to sign the returned payment event
const payment = await window.nostr.signEvent(service.payment);

// Use another GET request to send the signed payment event
// to the returned callback url to obtain a lightning invoice
const invoice = await fetch(service.callback + `?amount=${service.amount}&nostr=${encodeURIComponent(JSON.stringify(payment))}`);

// Prompt user to pay the lightning invoice...

```


### Step 2: Prompt user to pay the lightning invoice

The user's account will be credited as soon as Satellite detects that the
invoice was paid (usually within a few seconds)


### Step 3: Fetch user's account to confirm that purchase succeeded

```js
// Prompt user to sign auth event requesting account info
const requestAccount = await window.nostr.signEvent({
  created_at: Math.ceil(Date.now() / 1000),
  content: 'Authenticate User',
  kind: 22242,
  tags: []
});

// Fetch user's account info
const account = await fetch(`https://api.satellite.earth/v1/media/account?auth=${encodeURIComponent(JSON.stringify(requestAccount))}`);

// Check if storage was allocated
if (account.creditTotal > 0) {
  alert('payment succeeded');
}
```

Note that the account object contains much more information than just `creditTotal` (including information about specific payments). See the [API section](#api) below for a comprehensive explanation.


### Step 4: Upload a file

```js
// Prompt user to sign auth event for file upload.
// Note that all tags are optional (see API section)
const uploadAuth = await window.nostr.signEvent({
  created_at: Math.ceil(Date.now() / 1000),
  kind: 22242,
  content: 'Authorize Upload',
  tags: [
    [ 'name', file.name ],
    [ 'size', 1234567 ],
    [ 'label', 'foo' ]
  ]
});

// Prompt user to select a file to upload and
// send it as the body of a PUT request 
const response = await fetch(`https://api.satellite.earth/v1/media/item?auth=${encodeURIComponent(JSON.stringify(uploadAuth))}`, {
  method: 'PUT',
  body: file
});

// {
//     "created": 1685997838,
//     "sha256": "60bb967f08cb8721def12810243673bcb4b046e0733ec901be2e3ffd904ed274",
//     "name": "Space Odyssey Theme.mp4",
//     "url": "https://cdn.satellite.earth/60bb967f08cb8721def12810243673bcb4b046e0733ec901be2e3ffd904ed274.mp4",
//     "infohash": "a233527c1dc9380f8aec6c23b0db4044c75ae39a",
//     "magnet": "magnet:?xt=urn:btih:a233527c1dc9380f8aec6c23b0db4044c75ae39a&dn=Space+Odyssey+Theme.mp4&tr=udp%3A%2F%2Ftracker.leechers-paradise.org%3A6969&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969&tr=udp%3A%2F%2Ftracker.opentrackr.org%3A1337&tr=udp%3A%2F%2Fexplodie.org%3A6969&tr=udp%3A%2F%2Ftracker.empire-js.us%3A1337&tr=wss%3A%2F%2Ftracker.btorrent.xyz&tr=wss%3A%2F%2Ftracker.openwebtorrent.com",
//     "size": 4842030,
//     "type": "video/mp4",
//     "nip94": [
//         [ "x", "60bb967f08cb8721def12810243673bcb4b046e0733ec901be2e3ffd904ed274" ],
//         [ "m", "video/mp4" ],
//         [ "i", "a233527c1dc9380f8aec6c23b0db4044c75ae39a" ],
//         [ "url", "https://cdn.satellite.earth/60bb967f08cb8721def12810243673bcb4b046e0733ec901be2e3ffd904ed274.mp4" ],
//         [ "name", "Space Odyssey Theme.mp4" ],
//         [ "size", "4842030" ],
//         [ "magnet", "magnet:?xt=urn:btih:a233527c1dc9380f8aec6c23b0db4044c75ae39a&dn=Space+Odyssey+Theme.mp4&tr=udp%3A%2F%2Ftracker.leechers-paradise.org%3A6969&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969&tr=udp%3A%2F%2Ftracker.opentrackr.org%3A1337&tr=udp%3A%2F%2Fexplodie.org%3A6969&tr=udp%3A%2F%2Ftracker.empire-js.us%3A1337&tr=wss%3A%2F%2Ftracker.btorrent.xyz&tr=wss%3A%2F%2Ftracker.openwebtorrent.com" ]
//     ]
// }
```

When the upload completes successfully, the API returns a reponse with the file metadata, including tags that the client can use to create an NIP-94 event.


## API

All routes listed below are relative to the endpoint `https://api.satellite.earth/v1/media`. 

Note that for all requests that require an `auth` param, the request may be fail with a `403` response if the `created_at` field of the kind `22242` event deviates too far from the time of the request according to the server.


## `PUT /item` - Upload a file

#### Params

- `auth` - The signed, stringified, url-encoded kind `22242` event to authorize a file upload. The value of the `content` field MUST be equal to `Authorize Upload`. Clients MAY include any or all of the following tags in the signed auth event: a `name` tag to indicate the file's name, a `size` tag (which, if present, will cause the request to fail if the actual size of the file does not match this value) and a `label` tag (the value being an arbitary string which applications might need to otherwise classify/identify the uploaded file).

#### Returns

`200` - File uploaded successfully

- `created` `Number`- Time of upload, according to server
- `sha256` `String` - SHA256 hash as computed by server
- `name` `String` - Filename as provided by client
- `url` `String` - URL to access file on CDN
- `infohash` `String` - Torrent infohash as computed by server
- `magnet` `String` - Torrent magnet link
- `size` `Number` - File size in bytes
- `type` `String` - File MIME type as inferred by server
- `nip94` `Array` - Tags for creating NIP-94 event, if that's what the client wants to do
- `label` `String` - Value from label tag in auth event, if provided

`400` - Bad request

`402` - Payment required (ensure that account has credit)

`403` - Auth missing or failed to verify


#### Body

The body of the request MUST contain the file's data


## `DELETE /item` - Delete a file

#### Params

- `auth` - The signed, stringified, url-encoded kind `22242` event to authorize a file deletion. Clients MUST specify the `sha256` hash of the file they wish to delete as a tag in this event. The value of the `content` field MUST be equal to `Delete Item`.

#### Returns

`200` - File deleted successfully

`400` - Bad request (probably missing `sha256` tag)

`403` - Auth missing or failed to verify


## `GET /account` - Get user account info

#### Params

- `auth` - The signed, stringified, url-encoded kind `22242` event to authorize fetching account info. The value of the `content` field MUST be equal to `Authenticate User`.

#### Returns

`200` - Fetched account

- `storageTotal` `Number` - Total bytes currently stored
- `creditTotal` `Number` - Total number of GB months purchased to date
- `usageTotal` `Number` - Total number of GB months used to date
- `paidThrough` `Number` - Timestamp at which storage will expire
- `timeRemaining` `Number` - Seconds remaining until storage expires, from time of request
- `rateFiat` `Object` - Cost per GB per month in various fiat currencies
  - `usd` `Number` - Rate per GB per month in US dollars
- `exchangeFiat` `Object` - Exchange rate between sats and various fiat currencies at time of request
  - `usd` `Number` - Exchange rate beteen sats and US dollars at time of request
- `files` `Array` - Metadata for currently stored files
  -  `File` `Object`
- `transactions` `Array` - Record of paid invoices
  - `Transaction` `Object`
  - `order` `Object` - Kind `9733` event representing Satellite's offer to purchase CDN service
  - `payment` `Object` - Kind `9734` event representing user's payment for service
  - `receipt` `Object` - Kind `9735` event confirming purchase of service

`403` - Auth missing or failed to verify


## `GET /account/credit` - Get an offer to buy credit

#### Params

- `auth` - The signed, stringified, url-encoded kind `22242` event to request an offer of services on behalf of the user. The event MUST include a `gb_months` tag specifying an integer number (formatted as a string) of GB months credit the user wants to purchase. The value of the `content` field MUST be equal to `Request Storage`.


#### Returns

`200` - Fetched account

- `callback` `String` - The URL to send to signed offer to
- `amount` `Number` - The amount *in millisats* requried for payment of requested service
- `rateFiat` `Object` - Cost per GB per month in various fiat currencies
  - `usd` `Number` - Rate per GB per month in US dollars
- `offer` `Object` - Kind `9733` event representing Satellite's offer to purchase CDN service

`403` - Auth missing or failed to verify