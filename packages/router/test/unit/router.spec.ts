import { MockBrowserHistoryLocation } from './../mock/browser-history-location.mock';
import { ViewportCustomElement } from './../../test/e2e/modules/src/components/viewport';
import { Router } from '../../src/index';
import { expect } from 'chai';
import { DI } from '../../../kernel/src';
import { CustomElementResource, Aurelia, DOM } from '../../../runtime/src';
import { BasicConfiguration } from '../../../jit/src';

describe('Router', () => {
  it('can be created', function () {
    this.timeout(30000);
    const sut = new Router(null);
  });

  it('loads viewports left and right', async function () {
    this.timeout(30000);
    const { host, router } = await setup();
    expect(host.textContent).to.contain('left');
    expect(host.textContent).to.contain('right');
    await teardown(host, router, -1);
  });

  it('navigates to foo in left', async function () {
    this.timeout(30000);
    const { host, router } = await setup();

    router.goto('/foo@left');
    await Promise.resolve();
    await Promise.resolve();
    expect(host.textContent).to.contain('foo');

    await teardown(host, router, 1);
  });

  it('clears viewport', async function () {
    this.timeout(30000);
    const { host, router } = await setup();

    router.goto('/foo@left');
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();
    expect(host.textContent).to.contain('foo');
    await freshState(router, 1);
    expect(host.textContent).to.not.contain('foo');

    await teardown(host, router, 1);
  });

  it('replaces foo in left', async function () {
    this.timeout(30000);
    const { host, router } = await setup();

    let historyLength = router.historyBrowser.history.length;
    router.goto('/foo@left');
    await Promise.resolve();
    await Promise.resolve();
    expect(host.textContent).to.contain('foo');
    expect(router.historyBrowser.history.length).to.equal(historyLength + 1);

    router.replace('/bar@left');
    await Promise.resolve();
    await Promise.resolve();
    expect(host.textContent).to.contain('bar');
    expect(router.historyBrowser.history.length).to.equal(historyLength + 1);

    await teardown(host, router, 1);
  });

  it('navigates to bar in right', async function () {
    this.timeout(30000);
    const { host, router } = await setup();

    router.goto('/bar@right');
    await Promise.resolve();
    await Promise.resolve();
    expect(host.textContent).to.contain('bar');

    await teardown(host, router, 1);
  });

  it('navigates to foo in left then bar in right', async function () {
    this.timeout(30000);
    const { host, router } = await setup();

    router.goto('/foo@left');
    await Promise.resolve();
    await Promise.resolve();
    expect(host.textContent).to.contain('Viewport: foo');
    expect(host.textContent).to.not.contain('Viewport: bar');

    router.goto('/bar@right');
    await Promise.resolve();
    await Promise.resolve();
    expect(host.textContent).to.contain('Viewport: foo');
    expect(host.textContent).to.contain('Viewport: bar');

    await teardown(host, router, 2);
  });

  it('navigates back and forward with one viewport', async function () {
    this.timeout(40000);
    const { host, router } = await setup();

    router.goto('/foo@left');
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();
    expect(host.textContent).to.contain('Viewport: foo');
    expect(host.textContent).to.not.contain('Viewport: bar');

    router.goto('/bar@left');
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();
    expect(host.textContent).to.not.contain('Viewport: foo');
    expect(host.textContent).to.contain('Viewport: bar');

    router.back();
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();
    expect(host.textContent).to.contain('Viewport: foo');
    expect(host.textContent).to.not.contain('Viewport: bar');

    router.forward();
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();
    expect(host.textContent).to.not.contain('Viewport: foo');
    expect(host.textContent).to.contain('Viewport: bar');

    await teardown(host, router, 4);
  });

  // it('navigates back and forward with two viewports', async function () {
  //   this.timeout(30000);
  //   const { host, router } = await setup();

  //   router.goto('/foo@left');
  //   await Promise.resolve();
  // await Promise.resolve();
  //   expect(host.textContent).to.contain('Viewport: foo');
  //   expect(host.textContent).to.not.contain('Viewport: bar');

  //   router.goto('/bar@right');
  //   await Promise.resolve();
  // await Promise.resolve();
  //   expect(host.textContent).to.contain('Viewport: foo');
  //   expect(host.textContent).to.contain('Viewport: bar');

  //   router.back();
  //   await Promise.resolve();
  // await Promise.resolve();
  //   expect(host.textContent).to.contain('Viewport: foo');
  //   expect(host.textContent).to.not.contain('Viewport: bar');

  //   router.forward();
  //   await Promise.resolve();
  // await Promise.resolve();
  //   expect(host.textContent).to.contain('Viewport: foo');
  //   expect(host.textContent).to.contain('Viewport: bar');

  //   await teardown(host, router, 4);
  // });

  it('navigates to foo/bar in left/right', async function () {
    this.timeout(30000);
    const { host, router } = await setup();

    router.goto('/foo@left+bar@right');
    await Promise.resolve();
    await Promise.resolve();
    expect(host.textContent).to.contain('foo');
    expect(host.textContent).to.contain('bar');

    await teardown(host, router, 1);
  });

  it('cancels if not canLeave', async function () {
    this.timeout(30000);
    const { host, router } = await setup();

    router.goto('/baz@left+qux@right');
    await Promise.resolve();
    await Promise.resolve();
    expect(host.textContent).to.contain('Viewport: baz');
    expect(host.textContent).to.contain('Viewport: qux');
    router.goto('/foo@left+bar@right');
    await Promise.resolve();
    await Promise.resolve();
    expect(host.textContent).to.contain('Viewport: baz');
    expect(host.textContent).to.contain('Viewport: qux');
    expect(host.textContent).to.not.contain('Viewport: foo');
    expect(host.textContent).to.not.contain('Viewport: bar');

    await teardown(host, router, 2);
  });

  it('navigates to foo/bar in left/right containing baz/qux respectively', async function () {
    this.timeout(30000);
    const { host, router } = await setup();

    router.goto('/foo@left+bar@right+baz@foo+qux@bar');
    await Promise.resolve();
    await Promise.resolve();
    expect(host.textContent).to.contain('Viewport: foo');
    expect(host.textContent).to.contain('Viewport: bar');
    expect(host.textContent).to.contain('Viewport: baz');
    expect(host.textContent).to.contain('Viewport: qux');

    await teardown(host, router, 1);
  });

  it('handles anchor click', async function () {
    this.timeout(30000);
    const { host, router } = await setup();

    router.goto('/foo@left');
    await Promise.resolve();
    await Promise.resolve();
    expect(host.textContent).to.contain('foo');

    (<any>host).getElementsByTagName('SPAN')[0].click();
    await Promise.resolve();
    await Promise.resolve();
    expect(host.textContent).to.contain('Viewport: baz');

    await teardown(host, router, 1);
  });

  it('loads scoped viewport', async function () {
    this.timeout(30000);
    const { host, router } = await setup();

    router.goto('/quux@left');
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();
    expect(host.textContent).to.contain('Viewport: quux');

    router.goto('/quux@quux!');
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();
    console.log(host.innerHTML);
    expect(host.textContent).to.contain('Viewport: quux');

    router.goto('/quux@left/foo@quux!');
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();
    console.log(host.innerHTML);
    expect(host.textContent).to.contain('Viewport: foo');

    (<any>host).getElementsByTagName('SPAN')[0].click();
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();
    console.log(host.innerHTML);
    expect(host.textContent).to.contain('Viewport: baz');

    router.goto('/bar@left');
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();
    expect(host.textContent).to.contain('Viewport: bar');
    expect(host.textContent).to.not.contain('Viewport: quux');

    await teardown(host, router, 1);
  });

});

let quxCantLeave = 2;

let setup = async (): Promise<{ au, container, host, router }> => {
  const container = DI.createContainer();
  container.register(<any>BasicConfiguration);
  const App = (<any>CustomElementResource).define({ name: 'app', template: '<template><viewport name="left"></viewport><viewport name="right"></viewport></template>' });
  const Foo = (<any>CustomElementResource).define({ name: 'foo', template: '<template>foo <a href="#/baz@foo"><span>baz</span></a><viewport name="foo"></viewport></template>' });
  const Bar = (<any>CustomElementResource).define({ name: 'bar', template: '<template>bar<viewport name="bar"></viewport></template>' });
  const Baz = (<any>CustomElementResource).define({ name: 'baz', template: '<template>baz<viewport name="baz"></viewport></template>' });
  const Qux = (<any>CustomElementResource).define({ name: 'qux', template: '<template>qux<viewport name="qux"></viewport></template>' }, class {
    canEnter() { return true; }
    canLeave() { if (quxCantLeave > 0) { quxCantLeave--; return false; } else { return true; } }
    enter() { return true; }
    leave() { return true; }
  });
  const Quux = (<any>CustomElementResource).define({ name: 'quux', template: '<template>quux<viewport name="quux" scope></viewport></template>' });
  container.register(<any>ViewportCustomElement);
  container.register(Foo, Bar, Baz, Qux, Quux);
  const au = new Aurelia(<any>container);
  const host = DOM.createElement('div');
  document.body.appendChild(<any>host);
  const component = new App();
  au.app({ component, host });
  au.start();

  container.register(<any>Router);
  const router = container.get(Router);
  const mockBrowserHistoryLocation = new MockBrowserHistoryLocation();
  mockBrowserHistoryLocation.changeCallback = router.historyBrowser.pathChanged;
  router.historyBrowser.history = <any>mockBrowserHistoryLocation;
  router.historyBrowser.location = <any>mockBrowserHistoryLocation;
  router.activate();
  await Promise.resolve();
  return { au, container, host, router }
}

let teardown = async (host, router, count) => {
  // await freshState(router, count);
  document.body.removeChild(host);
  router.deactivate();
}

let throttleCounter = 0;
let freshState = async (router, count) => {
  throttleCounter += (count * 2) + 2;
  router.goto('/-@left+-@right');
  await Promise.resolve();
  await Promise.resolve();
  await Promise.resolve();
  if (throttleCounter >= 9) {
    await wait();
  }
}
let wait = async () => {
  await new Promise((resolve) => {
    setTimeout(resolve, 1000);
    throttleCounter = 0;
  });
}
