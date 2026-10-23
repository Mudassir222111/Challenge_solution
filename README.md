
## Prerequisites

- **Node.js 16 or newer.** Check with `node -v`. If it's missing, run `brew install node` or download it from https://nodejs.org.
- **Git** (only for the TDD history check). Check with `git --version`. macOS offers to install it the first time you run it.

## Project layout

```
assertEquals-tdd/
├── assertEquals.js          # the implementation
├── assertEquals.test.js     # the Jest test suite
├── package.json
├── README.md
└── scripts/
    ├── jest-shim.js         # tiny offline test runner (used by verify-history)
    └── verify-history.js    # replays the git history to prove it is TDD
```

## Run the tests

1. Unzip the project and open Terminal in the folder:

   ```bash
   cd ~/Downloads/Interviews/Experian
   unzip ~/Downloads/assertEquals-tdd.zip
   cd assertEquals-tdd
   ```

2. Confirm you are in the right place. You should see `package.json`, `assertEquals.js` and `assertEquals.test.js`:

   ```bash
   ls
   ```

3. Install Jest (needs internet, takes under a minute):

   ```bash
   npm install
   ```

4. Run the suite:

   ```bash
   npm test
   ```

## Expected result

```
 PASS  ./assertEquals.test.js
  assertEquals
    ✓ fails for different strings
    ✓ equal strings do not throw
    ...

Test Suites: 1 passed, 1 total
Tests:       54 passed, 54 total
```

If both lines show all tests passing, the implementation is confirmed.

## Useful commands

| Goal | Command |
|---|---|
| Run all tests | `npm test` |
| Re-run automatically when files change | `npx jest --watch` |
| Run one test by name | `npx jest -t "reports the full path"` |
| Show every test name | `npx jest --verbose` |
| Replay the TDD history (no install needed) | `node scripts/verify-history.js` |

## Verify the TDD history

The git history is the TDD workflow. Each commit is labelled:

| Prefix | Meaning | What must be true |
|---|---|---|
| `red:` | One new failing test | At least one test fails and no earlier test breaks |
| `green:` | The minimum code to pass it | All tests pass |
| `refactor:` | Clean-up with no behaviour change | All tests pass |
| `test(guard):` | A test that passed straight away | All tests pass |

See the story:

```bash
git log --oneline --reverse
```

Prove every commit matches its label:

```bash
node scripts/verify-history.js
```

The last line should read `History is valid TDD: every red failed, every green/refactor/guard passed.`

To step through it yourself:

```bash
git checkout <sha-of-a-red-commit>    # then: npx jest  -> newest test fails
git checkout <sha-of-next-green>      # then: npx jest  -> everything passes
git checkout main                     # return to the end
```

## See a test fail on purpose

1. Open `assertEquals.js` and search (Cmd+F) for `Unexpected`.
2. Change the word to `Surprise` and save.
3. Run `npm test`. The tests covering unexpected properties fail with a message diff.
4. Change it back to `Unexpected` and run `npm test` again. Everything passes.

## Error messages the tests check

| Situation | Message |
|---|---|
| Different values | `Expected "abcef" but found "abc"` |
| Different values, nested | `Expected propB.propA[1].propB "b" but found "c"` |
| Array vs object | `Expected array but found object` |
| Array length | `Expected array length 2 but found 3` |
| Missing property | `Expected propB.propC but was not found` |
| Extra property | `Unexpected propB.propC found` |
| Type mismatch | `Expected type null but found type Object` |

## Troubleshooting

| Problem | Fix |
|---|---|
| `command not found: npm` | Install Node.js, then quit and reopen Terminal |
| `Cannot find module './assertEquals'` | The test and implementation files must be in the same folder. Run `ls` to check |
| `npm install` fails with a network error | Check your internet connection or VPN, then retry |
| `Cannot find module .../tdd/...` | You are in the wrong folder or the zip was not fully extracted. Re-unzip and `cd` into `assertEquals-tdd` |
| `git: command not found` | Run `xcode-select --install`, then retry |
| `fatal: detected dubious ownership` | Run `git config --global --add safe.directory "$(pwd)"` |
| Jest reports "no tests found" | The test file name must end in `.test.js` |


