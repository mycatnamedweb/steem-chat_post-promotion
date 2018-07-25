
// vvvvvvvvvvvvvvvvvvvvvvvvvvvv CHANGE THESE IF YOU WANT vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv

const MAX_RANDOM_DELAY_MINS = 20;
let intro = ``;

// ^^^^^^^^^^^^^^^^^^^^^^^^^^^^ CHANGE THESE IF YOU WANT ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^



/* VERS 1.0 */

// vars

const chatMsg = `{message}
{link}`;
let promotedLink = '';
let timeoutRis = 0;
let lastCommentTs = new Date().getTime(); // initialized in case link changed straight away


// utils

const sleep = (durationMs) => new Promise(resolve => setTimeout(() => {resolve()}, durationMs));
const now = () => new Date().toString().split(' ').slice(1,5).join(' ');


// main logic helpers

async function navigateToChannel() {
  console.log(`${now()} -- Navigating to "steem.chat/channel/postpromotion"..`);
  const warning = document.createElement('div');
  const myStyle = warning.style;
  myStyle.border = '2px solid red';
  myStyle.padding = '50px';
  myStyle['text-align'] = 'center';
  myStyle['background-color'] = 'orange';
  myStyle.width = '500px';
  myStyle.position = 'fixed';
  myStyle.top = '200px';
  myStyle.left = '40%';
  warning.innerHTML = `<h4 style="color:red">Navigating to the postpromotion channel...</h3>
    <br><small>(Your current message will be saved anyway)</small>`;
  document.body.appendChild(warning);
  await sleep(5000);
  warning.parentNode.removeChild(warning)
  const channel = document.querySelectorAll('a[title="postpromotion"]')[0];
  channel.click();
  await sleep(1000);
  console.log(`${now()} -- Navigated.`);
}

async function addComment() {
  console.log(`${now()} -- Adding comment..`);
  const textarea = document.querySelectorAll(
    'textarea[class="rc-message-box__textarea js-input-message autogrow-short"]'
  )[0];
  textarea.value = chatMsg.replace('{message}', intro).replace('{link}', promotedLink);
  textarea.dispatchEvent(new Event('input', { bubbles: true }));
  textarea.dispatchEvent(new Event('keypress', { bubbles: true }));
  await sleep(1000);
  const submitBtn = document.querySelectorAll(
    'div[class="rc-message-box__icon rc-message-box__send js-send"]'
  )[0];
  submitBtn.click();
  lastCommentTs = new Date().getTime();
  console.log(`${now()} -- Commented.`);
  await sleep(5000);
}

const launchFutureComment = () => {
  const randomTime = Math.floor(Math.random() * (MAX_RANDOM_DELAY_MINS * 60 * 1000) - 1) + 1; // 0 to MAX_RANDOM_DELAY_MINS mins
  const moreThanTwoHours = 2 * 60 * 60 * 1000 + randomTime;
  console.log(`${now()} -- Next comment will be in ${(
    moreThanTwoHours - randomTime) / 1000 / 60} mins + ${Math.floor(randomTime / 1000 / 60)} mins. Link: ${promotedLink}\n
  If you want to change the promoted link at any time you can use:\n
    changeLink(
      'https://steemit.com/THIS_IS_YOUR_NEW_LINK',
      'Hi, here is my new post!'
    );
  `);
  timeoutRis = setTimeout(() => periodicallyCommentOnSteemChat(), moreThanTwoHours);
}

// main logic flow

async function periodicallyCommentOnSteemChat() {
  console.log(`${now()} -- ${timeoutRis ? `2hs + max ${MAX_RANDOM_DELAY_MINS} mins passed. ` : ''}Starting commenting process..`);
  if (window.location.href !== 'https://steem.chat/channel/postpromotion') {
    await navigateToChannel();
  }
  await addComment();
  launchFutureComment();
}


// startup

if (window.location.href.indexOf('steem.chat') === -1) {
  alert(`You gotta execute this link on a https://steem.chat domain!`);
  throw 'NOT_ON_STEEM_CHAT';
}

async function startWithLink(link, initialDelayMins = 0, newIntro) {
  if (!link || link.indexOf('https://steemit.com') === -1) {
    alert('Provide a Steemit link as first argument!');
    throw new Error('NO_LINK');
  }
  promotedLink = link;
  intro = newIntro || intro;
  if (initialDelayMins) {
    console.log(`${now()} -- Sleeping for ${initialDelayMins} mins`);
    await sleep(initialDelayMins * 60 * 1000);
    console.log(`${now()} -- Woke up.`);
  }
  periodicallyCommentOnSteemChat();
}

const changeLink = (link, newIntro) => {
  if (!link || link.indexOf('https://steemit.com') === -1) {
    alert('Provide a Steemit link as first argument!');
    throw new Error('NO_LINK');
  }
  clearTimeout(timeoutRis);
  const remainingDelay = (2 * 60 * 60 * 1000) - (new Date().getTime() - lastCommentTs);
  console.log(`Your new link ${link} will be posted in ${remainingDelay / 1000 / 60} mins`);
  startWithLink(link, remainingDelay, newIntro);
}

let githubW;
window.onbeforeunload = () => {
  if (!githubW || githubW.window.closed)
    githubW = open('https://github.com/mycatnamedweb/steem-chat_post-promotion/blob/master/chat-messager.js');
  return "Dude, are you sure you want to leave? Think of the kittens!";
};

document['🤖'] = `
    This script automatically promotes your link every 2hs or so.
   - TO START USE:
     startWithLink(
       // 👇 Your Steemit Link
      'https://steemit.com/THIS_IS_YOUR_POST_LINK',
      // 👇 Initial delay in minutes here or leave 0
      0,
      // 👇 Your post introduction. Leave blank otherwise or change the default one on top page.
      'Hey guys, check out my post! 😎'
    );
  - AFTER A FEW HOURS OR DAYS TO CHANGE THE LINK USE:
    changeLink(
      // 👇 Your new Steemit link
      'https://steemit.com/THIS_IS_YOUR_NEW_LINK',
      // 👇 Your new post introduction. Leave blank to use the default or the one you previosly entered.
      'Hi, here is my new post!'
    );
`;
