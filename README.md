# LeetCode Rich Presence

A simple (work in progress) Discord Rich Presence for LeetCode.
It works through a browser extension that obtains information, and a websocket server to update the status.


<img src="assets/profile_1.png" alt="Demo 1" style="height: 200px;"/>
<img src="assets/profile_2.png" alt="Demo 2" style="height: 200px;"/>

# TODO List

- Containerize the server with Docker (easier to run)
- Add instructions for the browser extension (upload to Chrome Web Store too maybe?)
- Firefox support
- Fix Discord's RPC issues with timeouts (and rate-limits)
- Make a web dashboard to manage the server (and maybe remove the auto-try-login feature)