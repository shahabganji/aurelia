import { children, Aurelia, CustomElement } from '@aurelia/runtime';
import { TestContext, assert } from '@aurelia/testing';
import { IContainer, PLATFORM } from '@aurelia/kernel';
import { ChildrenObserverSource } from '@aurelia/runtime/dist/definitions';

describe('ChildrenObserver', () => {
  describe('populates', () => {
    it('children array with child view models', () => {
      const { au, viewModel, ChildOne, ChildTwo } = createAppAndStart();
      assert.equal(viewModel.children.length, 2);
      assert.instanceOf(viewModel.children[0], ChildOne);
      assert.instanceOf(viewModel.children[1], ChildTwo);

      au.stop();
    });

    it('children array with by custom query', () => {
      const { au, viewModel, ChildOne } = createAppAndStart({
        query: p => (p.host as HTMLElement).querySelectorAll('.child-one')
      });

      assert.equal(viewModel.children.length, 1);
      assert.instanceOf(viewModel.children[0], ChildOne);

      au.stop();
    });

    it('children array with by custom query, filter, and map', () => {
      const { au, viewModel, ChildOne } = createAppAndStart({
        query: p => (p.host as HTMLElement).querySelectorAll('.child-one'),
        filter: (node) => !!node,
        map: (node) => node
      });

      assert.equal(viewModel.children.length, 1);
      assert.equal(viewModel.children[0].tagName, ChildOne.description.name.toUpperCase());

      au.stop();
    });
  });

  describe('updates', () => {
    if (!PLATFORM.isBrowserLike) {
      return;
    }

    it('children array with child view models', (done) => {
      const { au, viewModel, ChildOne, ChildTwo, hostViewModel } = createAppAndStart();

      assert.equal(viewModel.children.length, 2);
      assert.equal(viewModel.childrenChangedCallCount, 0);

      hostViewModel.oneCount = 2;
      hostViewModel.twoCount = 2;

      waitForUpdate(() => {
        assert.equal(viewModel.children.length, 4);
        assert.equal(viewModel.childrenChangedCallCount, 1);
        assert.instanceOf(viewModel.children[0], ChildOne);
        assert.instanceOf(viewModel.children[1], ChildOne);
        assert.instanceOf(viewModel.children[2], ChildTwo);
        assert.instanceOf(viewModel.children[3], ChildTwo);
        au.stop();
        done();
      });
    });

    it('children array with by custom query', (done) => {
      const { au, viewModel, ChildTwo, hostViewModel } = createAppAndStart({
        query: p => (p.host as HTMLElement).querySelectorAll('.child-two')
      });

      assert.equal(viewModel.children.length, 1);
      assert.instanceOf(viewModel.children[0], ChildTwo);
      assert.equal(viewModel.childrenChangedCallCount, 0);

      hostViewModel.oneCount = 2;
      hostViewModel.twoCount = 2;

      waitForUpdate(() => {
        assert.equal(viewModel.children.length, 2);
        assert.equal(viewModel.childrenChangedCallCount, 1);
        assert.instanceOf(viewModel.children[0], ChildTwo);
        assert.instanceOf(viewModel.children[1], ChildTwo);
        au.stop();
        done();
      });
    });

    it('children array with by custom query, filter, and map', (done) => {
      const { au, viewModel, ChildTwo, hostViewModel } = createAppAndStart({
        query: p => (p.host as HTMLElement).querySelectorAll('.child-two'),
        filter: (node) => !!node,
        map: (node) => node
      });

      const tagName = ChildTwo.description.name.toUpperCase();

      assert.equal(viewModel.children.length, 1);
      assert.equal(viewModel.children[0].tagName, tagName);
      assert.equal(viewModel.childrenChangedCallCount, 0);

      hostViewModel.oneCount = 2;
      hostViewModel.twoCount = 2;

      waitForUpdate(() => {
        assert.equal(viewModel.children.length, 2);
        assert.equal(viewModel.childrenChangedCallCount, 1);
        assert.equal(viewModel.children[0].tagName, tagName);
        assert.equal(viewModel.children[1].tagName, tagName);
        au.stop();
        done();
      });
    });
  });

  function waitForUpdate(callback: Function) {
    Promise.resolve().then(() => callback());
  }

  function createAppAndStart(childrenOptions?: ChildrenObserverSource) {
    const ctx = TestContext.createHTMLTestContext();
    const { container } = ctx;

    const HostElement = defineAndRegisterElementWithChildren(container, childrenOptions);
    const ChildOne = defineAndRegisterElement('child-one', container);
    const ChildTwo = defineAndRegisterElement('child-two', container);
    const component = defineAndRegisterHost(
      `
        <element-with-children>
          <child-one repeat.for="n of oneCount" class="child-one"></child-one>
          <child-two repeat.for="n of twoCount" class="child-two"></child-two>
        </element-with-children>
      `,
      container
    );

    const au = new Aurelia(container);
    const host = ctx.createElement(component.description.name);

    au.app({ host, component });
    au.start();

    const hostViewModel = (host as any).$controller.viewModel;
    const viewModel = (host.children[0] as any).$controller.viewModel;

    return {
      au,
      hostViewModel,
      viewModel,
      ChildOne,
      ChildTwo
    };
  }

  function defineAndRegisterElementWithChildren(container: IContainer, options?: ChildrenObserverSource) {
    class ElementWithChildren {
      @children(options) public children;
      public childrenChangedCallCount = 0;
      public childrenChanged() {
        this.childrenChangedCallCount++;
      }
    }

    const element = CustomElement.define({
      name: 'element-with-children',
      template: `<slot></slot>`
    }, ElementWithChildren);

    container.register(element);

    return element;
  }

  function defineAndRegisterHost(template: string, container: IContainer) {
    class HostElement {
      oneCount = 1;
      twoCount = 1;
    }

    const element = CustomElement.define({
      name: 'host-element',
      template
    }, HostElement);

    container.register(element);

    return element;
  }

  function defineAndRegisterElement(name: string, container: IContainer) {
    class Element {
    }

    const element = CustomElement.define({
      name: name,
      template: `<div>My name is ${name}.`
    }, Element);

    container.register(element);

    return element;
  }
});
