import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import * as jsx from 'react/jsx-runtime';

// Run the actual page handlers with controlled hooks, network and animation timers.
async function createPage() {
  const hooks = [];
  let cursor = 0;
  let pendingEffects = [];
  const timers = new Map();
  let timerId = 0;
  const storage = new Map();
  const data = { id: 'test', title: 'Violentomètre', categories: [
    { id: 'c1', name: 'Première catégorie', questions: [
      { id: 'q1', text: 'Question 1', options: [{ id: 'o1', text: 'Oui', points: 1 }] },
      { id: 'q2', text: 'Question 2', options: [{ id: 'o2', text: 'Oui', points: 1 }] },
    ] },
    { id: 'c2', name: 'Deuxième catégorie', questions: [
      { id: 'q3', text: 'Question 3', options: [{ id: 'o3', text: 'Oui', points: 1 }] },
    ] },
  ] };
  const sameDeps = (a, b) => a && b && a.length === b.length && a.every((value, index) => Object.is(value, b[index]));
  const react = {
    useState(initial) {
      const index = cursor++;
      if (!(index in hooks)) hooks[index] = { value: initial };
      return [hooks[index].value, (next) => { hooks[index].value = typeof next === 'function' ? next(hooks[index].value) : next; }];
    },
    useRef(initial) {
      const index = cursor++;
      if (!(index in hooks)) hooks[index] = { current: initial };
      return hooks[index];
    },
    useMemo(factory, deps) {
      const index = cursor++;
      if (!sameDeps(hooks[index]?.deps, deps)) hooks[index] = { value: factory(), deps };
      return hooks[index].value;
    },
    useCallback(callback, deps) { return react.useMemo(() => callback, deps); },
    useEffect(effect, deps) {
      const index = cursor++;
      if (!sameDeps(hooks[index]?.deps, deps)) {
        const previous = hooks[index];
        hooks[index] = { deps, cleanup: previous?.cleanup };
        pendingEffects.push(() => { hooks[index].cleanup?.(); hooks[index].cleanup = effect(); });
      }
    },
  };
  const dependencies = {
    react,
    'react/jsx-runtime': jsx,
    'framer-motion': { motion: new Proxy({}, { get: (_, name) => name }), AnimatePresence: 'AnimatePresence' },
    'next/link': { default: 'a' },
    '@/components/CategoryIntroduction': { default: 'CategoryIntroduction' },
    '@/components/LigueContacts': { default: 'LigueContacts' },
    '@/components/DiagnosticResultShare': { default: 'DiagnosticResultShare' },
    '@/lib/analytics-client': { getClientAnalyticsContext: () => ({}), sendAnalyticsEvent: () => {} },
    'lucide-react': new Proxy({}, { get: (_, name) => name }),
    '@/data/questions': { categories: [] },
  };
  const exports = {};
  const source = fs.readFileSync(new URL('../../src/app/diagnostic/page.tsx', import.meta.url), 'utf8');
  const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX } }).outputText;
  vm.runInNewContext(code, {
    exports, require: (name) => { assert.ok(name in dependencies, name); return dependencies[name]; },
    console, Date, Set, crypto: { randomUUID: () => 'attempt' },
    window: { localStorage: { getItem: (key) => storage.get(key), setItem: (key, value) => storage.set(key, value), removeItem: (key) => storage.delete(key) } },
    fetch: async () => ({ ok: true, json: async () => ({ diagnostics: [{ ...data, totalQuestions: 3, totalCategories: 2 }] }) }),
    setTimeout: (callback) => { timers.set(++timerId, callback); return timerId; },
    clearTimeout: (id) => timers.delete(id),
  });
  function render() {
    cursor = 0;
    const tree = exports.default();
    const effects = pendingEffects;
    pendingEffects = [];
    effects.forEach((effect) => effect());
    return tree;
  }
  function nodes(tree) {
    if (!tree || typeof tree !== 'object') return [];
    if (Array.isArray(tree)) return tree.flatMap(nodes);
    return [tree, ...nodes(tree.props?.children)];
  }
  const button = (tree, label) => nodes(tree).find((node) => node.type === 'button' && nodes(node.props.children).some((child) => child.props?.children === label)
    || node.type === 'button' && (node.props.children === label || node.props.children?.includes?.(label)));
  const answer = (tree) => nodes(tree).find((node) => node.type === 'button' && node.props.className?.includes('radio-option'));
  render();
  await new Promise((resolve) => setImmediate(resolve));
  let tree = render();
  button(tree, 'Violentomètre').props.onClick();
  render();
  tree = render();
  button(tree, 'Pour moi-même').props.onClick();
  tree = render();
  assert.equal(tree.type, 'CategoryIntroduction');
  tree.props.onStart();
  tree = render();
  return { render, button, answer, nodes, tree, advance: () => { const entries = [...timers]; timers.clear(); entries.forEach(([, callback]) => callback()); } };
}

test('answering the last question of a category continues to the next question', async () => {
  const page = await createPage();
  page.answer(page.tree).props.onClick();
  page.advance();
  let tree = page.render();
  page.answer(tree).props.onClick();
  page.advance();
  tree = page.render();
  assert.notEqual(tree.type, 'CategoryIntroduction');
  assert.ok(page.nodes(tree).some((node) => node.props?.children === 'Question 3'));
  page.button(tree, 'Précédent').props.onClick();
  tree = page.render();
  assert.ok(page.nodes(tree).some((node) => node.props?.children === 'Question 2'));
});

test('an exiting answer button cannot advance a different question', async () => {
  const page = await createPage();
  const oldAnswer = page.answer(page.tree);
  oldAnswer.props.onClick();
  page.advance();
  page.render();
  oldAnswer.props.onClick();
  page.advance();
  const tree = page.render();
  assert.ok(page.nodes(tree).some((node) => node.props?.children === 'Question 2'));
});

test('restarting cancels a pending answer transition', async () => {
  const page = await createPage();
  page.answer(page.tree).props.onClick();
  page.button(page.tree, 'Recommencer').props.onClick();
  page.advance();
  let tree = page.render();
  page.button(tree, 'Violentomètre').props.onClick();
  page.render();
  tree = page.render();
  page.button(tree, 'Pour moi-même').props.onClick();
  tree = page.render();
  tree.props.onStart();
  tree = page.render();
  assert.ok(page.nodes(tree).some((node) => node.props?.children === 'Question 1'));
});

test('all questions complete without repeating the start screen', async () => {
  const page = await createPage();
  let tree = page.tree;
  for (let index = 1; index <= 3; index++) {
    assert.ok(page.nodes(tree).some((node) => node.props?.children === `Question ${index}`));
    page.answer(tree).props.onClick();
    page.advance();
    tree = page.render();
  }
  assert.ok(page.nodes(tree).some((node) => node.props?.children === 'Résultats par catégorie'));
});
