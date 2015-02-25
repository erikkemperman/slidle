To Do
=====

* Our required 3rd party assets are just dropped in a separate folder, it would
  be nice to use Bower to manage our dependencies.
* In fact, we could make the whole Slidle project available to others via Bower.
* There are no unit tests at present, but things are set up in such a way that
  hooking up karma/jasmine/phantomjs, for instance, should be straightforward.
* The edits to slideshows are currently only stored in LocalStorage. It would be
  nice to support external storage, e.g. a REST endpoint or GitHub. Of course,
  that would also require dealing with a potential for conflicts due to
  concurrent edits.
* Adding an application manifest would allow us to use the webapp while offline.
* Currently we are a bit mouse/keyboard centric; touch events work, but it is
  not yet possible, for instance, to use swipe gestures for navigation.
* Bookmarklet to save to homescreen on mobile devices?
* I've been trying to keep screen and print styles separate, but need to spend
  a bit more time to actually make the thing printer friendly (in particular,
  `page-break` properties seem to be ignored by all browsers I've tried...).
* If we encounter slides with so much text that it requires (vertical) scrolling
  it would be nice to do this automatically in playback mode.
* Come to think of it, it might be a good idea to let the interval between the
  slides in playback mode be a function of the "amount of text", somehow.
* We use a number of "modern" techniques (HTML5, ES5, CSS3) but do not provide
  shims or fallbacks to support older browsers... These include:
  - WOFF fonts
  - flexbox
  - transitions
  - transforms
  - fullscreen

