// Content model for each question:
// { id, q, a, out, sample: [{file, content}], files: ['suggested/file/names'] }
// q/a support a tiny markdown subset: **bold**, `inline code`, fenced ```lang blocks, "- " bullet lists, blank-line paragraphs.

export const sections = [
  {
    id: 1,
    icon: 'folder_open',
    title: 'Ansible Directory Structure & Setup',
    blurb: 'Installation, ansible.cfg, and how a real project is laid out on disk.',
    levels: [
      {
        level: 'Beginner',
        questions: [
          {
            id: '1.1',
            q: 'What command checks whether Ansible is installed, and what does its output tell you?',
            a: "Run `ansible --version`. It confirms the install and reports several things you'll need when debugging later:\n\n- The **ansible-core** version (the engine version, separate from the `ansible` community package version).\n- The **config file** currently in effect (or `None` if none was found) — this tells you exactly which `ansible.cfg` is being read.\n- The **configured module search path**.\n- The **python version and executable path** Ansible itself is running under (not the remote host's python).\n\nIf the command isn't found at all, Ansible isn't installed or isn't on your `PATH`.",
            out: "$ ansible --version\nansible [core 2.16.3]\n  config file = /home/deploy/project/ansible.cfg\n  configured module search path = ['/home/deploy/.ansible/plugins/modules']\n  ansible python module location = /usr/lib/python3.11/site-packages/ansible\n  ansible collection location = /home/deploy/.ansible/collections\n  executable location = /usr/bin/ansible\n  python version = 3.11.6 (main, Oct  3 2023, 00:00:00) [GCC 13.2.1]\n  jinja version = 3.1.3\n  libyaml = True",
          },
          {
            id: '1.2',
            q: 'Where does Ansible look for its default configuration file if none is specified explicitly?',
            a: "Ansible checks four locations, **stopping at the first one it finds**:\n\n1. The path in the `ANSIBLE_CONFIG` environment variable, if set.\n2. `ansible.cfg` in the **current working directory** (where you run the command from).\n3. `~/.ansible.cfg` in the invoking user's **home directory**.\n4. `/etc/ansible/ansible.cfg`, the **system-wide** fallback.\n\nOnly one file is loaded — Ansible does not merge multiple `ansible.cfg` files together.",
            out: "$ ANSIBLE_CONFIG=/opt/app/custom.cfg ansible --version | grep 'config file'\n  config file = /opt/app/custom.cfg\n\n$ cd ~/project && unset ANSIBLE_CONFIG && ansible --version | grep 'config file'\n  config file = /home/deploy/project/ansible.cfg",
          },
          {
            id: '1.3',
            q: 'What is the purpose of the `ansible.cfg` file, and what are the three most common locations Ansible searches for one (in order of precedence)?',
            a: "`ansible.cfg` is the central place to set Ansible's default behavior — things like `inventory`, `remote_user`, `roles_path`, SSH arguments, fact caching, and retry/timeout settings — so you don't have to repeat them as CLI flags on every run.\n\nThe three most common locations, highest precedence first:\n\n1. **`./ansible.cfg`** — in the directory you invoke `ansible`/`ansible-playbook` from. This is the one used for a specific project.\n2. **`~/.ansible.cfg`** — a per-user default that applies across projects.\n3. **`/etc/ansible/ansible.cfg`** — the system-wide default installed on the machine.\n\n(The `ANSIBLE_CONFIG` environment variable, if set, beats all three — see the next question.)",
            files: ['ansible.cfg'],
            sample: [
              {
                file: 'ansible.cfg',
                content: '[defaults]\ninventory       = ./inventory/production\nremote_user     = deploy\nroles_path      = ./roles\nhost_key_checking = False\nretry_files_enabled = False\n\n[privilege_escalation]\nbecome          = True\nbecome_method   = sudo\nbecome_user     = root',
              },
            ],
          },
        ],
      },
      {
        level: 'Intermediate',
        questions: [
          {
            id: '1.4',
            q: 'Describe a typical Ansible project directory layout. What are the roles of the `inventory/`, `group_vars/`, `host_vars/`, `roles/`, and `playbooks/` directories?',
            a: "A conventional layout separates **what hosts exist** from **what variables apply to them** from **what work gets done**:\n\n- **`inventory/`** — defines the hosts and groups you can target (static `.ini`/`.yml` files, or dynamic plugin configs).\n- **`group_vars/`** — variables applied to every host in a given group; one file (or directory) per group name, e.g. `group_vars/webservers.yml`. `group_vars/all.yml` applies to every host.\n- **`host_vars/`** — variables applied to one specific host only, e.g. `host_vars/web1.example.com.yml`; these override group vars for that host.\n- **`roles/`** — self-contained, reusable units of automation (tasks, handlers, templates, defaults) that playbooks compose together.\n- **`playbooks/`** — the entry-point YAML files that map hosts to roles/tasks and are what you actually run with `ansible-playbook`.\n\nAnsible auto-loads `group_vars/` and `host_vars/` based on the inventory — you never `import` them manually.",
            files: [
              'inventory/hosts.yml',
              'group_vars/all.yml',
              'group_vars/webservers.yml',
              'host_vars/web1.example.com.yml',
              'roles/nginx/tasks/main.yml',
              'playbooks/site.yml',
            ],
            sample: [
              {
                file: 'project tree',
                content: 'project/\n├── ansible.cfg\n├── inventory/\n│   └── hosts.yml\n├── group_vars/\n│   ├── all.yml\n│   └── webservers.yml\n├── host_vars/\n│   └── web1.example.com.yml\n├── roles/\n│   └── nginx/\n│       ├── tasks/main.yml\n│       ├── handlers/main.yml\n│       ├── templates/nginx.conf.j2\n│       └── defaults/main.yml\n└── playbooks/\n    └── site.yml',
              },
            ],
          },
          {
            id: '1.5',
            q: 'What is the difference between the `roles_path` set in `ansible.cfg` and simply placing a `roles/` folder next to your playbook?',
            a: "Ansible always looks in a `roles/` directory **adjacent to the playbook being run** automatically — no config needed. `roles_path` in `ansible.cfg` **adds additional search directories on top of that**, so roles can be shared across multiple projects without copying them.\n\nWith `roles_path = /opt/ansible/shared_roles:/opt/ansible/team_roles`, a playbook can reference a role that lives in either shared directory even though it's not physically next to that playbook — useful when several projects/playbook repos need the same role library.\n\nAnsible searches in this order: the playbook's own `roles/` directory first, then each directory listed in `roles_path`, in order.",
            sample: [
              {
                file: 'ansible.cfg',
                content: '[defaults]\nroles_path = ./roles:/opt/ansible/shared_roles:/opt/ansible/team_roles',
              },
            ],
          },
          {
            id: '1.6',
            q: 'Explain what `ansible-galaxy init <role_name>` generates, and why each subdirectory (`tasks/`, `handlers/`, `templates/`, `files/`, `vars/`, `defaults/`, `meta/`) exists.',
            a: "It scaffolds the standard role skeleton so every role in every project has the same predictable shape:\n\n- **`tasks/main.yml`** — the actual list of steps the role performs; the role's entry point.\n- **`handlers/main.yml`** — tasks that only run when `notify`'d (e.g. restart a service after a config change).\n- **`templates/`** — Jinja2 (`.j2`) files rendered with the `template` module.\n- **`files/`** — static files copied as-is with the `copy`/`fetch` modules (no templating).\n- **`vars/main.yml`** — role variables with **high precedence**, meant to be internal/fixed and not casually overridden by users of the role.\n- **`defaults/main.yml`** — role variables with the **lowest precedence** of any variable type, meant to be easily overridden by callers (playbook `vars`, `group_vars`, etc.).\n- **`meta/main.yml`** — role metadata: author, license, supported platforms, and **role dependencies** (other roles that must run first).\n\nEmpty directories also get a placeholder file so they survive being committed to git.",
            files: ['roles/<role_name>/tasks/main.yml', 'roles/<role_name>/handlers/main.yml', 'roles/<role_name>/meta/main.yml'],
            sample: [
              {
                file: 'command',
                content: '$ ansible-galaxy init nginx',
              },
            ],
            out: "- Role nginx was created successfully\n\nnginx/\n├── README.md\n├── defaults/main.yml\n├── files/\n├── handlers/main.yml\n├── meta/main.yml\n├── tasks/main.yml\n├── templates/\n├── tests/\n│   ├── inventory\n│   └── test.yml\n└── vars/main.yml",
          },
        ],
      },
      {
        level: 'Advanced',
        questions: [
          {
            id: '1.7',
            q: "In a multi-environment project (e.g., `inventories/production/` and `inventories/staging/`), how would you structure directories so that `group_vars` and `host_vars` don't leak between environments?",
            a: "The key is to nest `group_vars/` and `host_vars/` **inside each environment's inventory directory** rather than sharing one top-level set. Ansible resolves `group_vars`/`host_vars` relative to the inventory file/directory in use for that run, so each environment stays isolated automatically — you don't need conditionals to keep them apart.\n\nYou point `ansible-playbook` at `-i inventories/production` or `-i inventories/staging`, and only that environment's vars are ever loaded. Shared defaults that truly apply everywhere can still live in a top-level `group_vars/all.yml` used by roles, but environment-specific values (DB hosts, credentials, capacity settings) belong under the environment's own tree.",
            files: [
              'inventories/production/hosts.yml',
              'inventories/production/group_vars/webservers.yml',
              'inventories/production/host_vars/web1.yml',
              'inventories/staging/hosts.yml',
              'inventories/staging/group_vars/webservers.yml',
            ],
            sample: [
              {
                file: 'project tree',
                content: 'project/\n├── inventories/\n│   ├── production/\n│   │   ├── hosts.yml\n│   │   ├── group_vars/\n│   │   │   ├── all.yml\n│   │   │   └── webservers.yml\n│   │   └── host_vars/\n│   │       └── web1.example.com.yml\n│   └── staging/\n│       ├── hosts.yml\n│       ├── group_vars/\n│       │   ├── all.yml\n│       │   └── webservers.yml\n│       └── host_vars/\n│           └── web1.staging.example.com.yml\n├── roles/\n└── playbooks/site.yml',
              },
              {
                file: 'command',
                content: '# Production run only ever sees inventories/production/group_vars & host_vars\n$ ansible-playbook -i inventories/production playbooks/site.yml\n\n# Staging run only ever sees inventories/staging/group_vars & host_vars\n$ ansible-playbook -i inventories/staging playbooks/site.yml',
              },
            ],
          },
          {
            id: '1.8',
            q: 'How does Ansible resolve configuration precedence between environment variables, `ansible.cfg`, and command-line flags? Give an example where all three set the same option differently.',
            a: "From lowest to highest precedence:\n\n1. **Built-in defaults** compiled into Ansible.\n2. **`ansible.cfg`** values (whichever file was found per the search order).\n3. **Environment variables** (e.g. `ANSIBLE_REMOTE_USER`).\n4. **Command-line flags** (e.g. `-u`), which **always win**.\n\nSo the effective value is whatever the most specific, most \"in-your-face\" source says — a flag typed on this exact invocation overrides an env var set for the shell session, which overrides a file that applies to every invocation.",
            sample: [
              {
                file: 'ansible.cfg',
                content: '[defaults]\nremote_user = bob',
              },
              {
                file: 'shell',
                content: 'export ANSIBLE_REMOTE_USER=alice',
              },
              {
                file: 'command',
                content: '$ ansible webservers -m ping -u carol',
              },
            ],
            out: "Effective remote_user = carol\n\n(carol from -u beats alice from ANSIBLE_REMOTE_USER,\n which beats bob from ansible.cfg)",
          },
        ],
      },
    ],
  },
  {
    id: 2,
    icon: 'terminal',
    title: 'Ansible Syntax Basics',
    blurb: 'YAML pitfalls, ad-hoc commands, and how modules differ from tasks.',
    levels: [
      {
        level: 'Beginner',
        questions: [
          {
            id: '2.1',
            q: 'What data serialization format do Ansible playbooks use, and what are the two most common mistakes beginners make with its indentation?',
            a: "Ansible playbooks are written in **YAML**. The two classic indentation mistakes:\n\n1. **Mixing tabs and spaces.** YAML forbids tabs for indentation entirely — a single stray tab produces a parse error that can be hard to spot visually.\n2. **Inconsistent indentation width between sibling items**, e.g. a list item's `-` and the following key not lining up, or two keys of the same mapping sitting at different column positions. YAML uses indentation to express structure, so a one-space drift silently changes what's nested under what (or breaks parsing outright).",
            sample: [
              {
                file: 'bad.yml (tabs — invalid)',
                content: 'tasks:\n\t- name: Install git\n\t  apt:\n\t    name: git',
              },
              {
                file: 'good.yml',
                content: 'tasks:\n  - name: Install git\n    apt:\n      name: git\n      state: present',
              },
            ],
            out: "$ ansible-playbook bad.yml --syntax-check\nERROR! Syntax Error while loading YAML.\nfound character '\\t' that cannot start any token\nThe offending line appears to be indented with a TAB character.",
          },
          {
            id: '2.2',
            q: 'Write an ad-hoc command that pings all hosts in your inventory using the `ping` module.',
            a: "`ansible all -m ping -i inventory` — `all` targets every host in the inventory, `-m ping` selects the `ping` module (which just verifies Python + SSH connectivity and returns `pong`; it does **not** send an ICMP packet), and `-i` points at your inventory file.",
            files: ['inventory'],
            sample: [
              {
                file: 'inventory',
                content: '[webservers]\nweb1.example.com\nweb2.example.com',
              },
              {
                file: 'command',
                content: '$ ansible all -m ping -i inventory',
              },
            ],
            out: 'web1.example.com | SUCCESS => {\n    "ansible_facts": {\n        "discovered_interpreter_python": "/usr/bin/python3.11"\n    },\n    "changed": false,\n    "ping": "pong"\n}\nweb2.example.com | SUCCESS => {\n    "ansible_facts": {\n        "discovered_interpreter_python": "/usr/bin/python3.11"\n    },\n    "changed": false,\n    "ping": "pong"\n}',
          },
          {
            id: '2.3',
            q: 'What is the difference between a *module* and a *task* in Ansible?',
            a: "A **module** is a reusable, self-contained unit of code shipped with (or added to) Ansible — `apt`, `copy`, `service`, `user`, etc. — that performs one kind of work and knows how to check/enforce a desired state.\n\nA **task** is a single entry in a play's `tasks:` list that *invokes* a module with specific arguments (plus optional keywords like `name`, `when`, `become`, `notify`). The module is the generic tool; the task is one concrete use of that tool with real parameters, in a real playbook.",
            sample: [
              {
                file: 'playbook.yml (task using the apt module)',
                content: 'tasks:\n  - name: Ensure git is installed   # <- this whole entry is the task\n    apt:                            # <- "apt" is the module being invoked\n      name: git\n      state: present',
              },
            ],
          },
        ],
      },
      {
        level: 'Intermediate',
        questions: [
          {
            id: '2.4',
            q: 'Convert this shell command into an ad-hoc Ansible command using the `apt` module: `sudo apt install nginx -y`.',
            a: "`sudo` becomes Ansible's `--become` (`-b`) flag, and `-y` (auto-confirm) is implicit in the `apt` module — it never prompts. `state: present` (or the shorthand `state=present`) expresses \"installed\".",
            files: ['inventory'],
            sample: [
              {
                file: 'command',
                content: '$ ansible all -b -m apt -a "name=nginx state=present update_cache=yes" -i inventory',
              },
            ],
            out: 'web1.example.com | CHANGED => {\n    "cache_update_time": 1751500000,\n    "cache_updated": true,\n    "changed": true,\n    "stdout": "Reading package lists...\\nBuilding dependency tree...\\nThe following NEW packages will be installed:\\n  nginx\\n...\\n"\n}',
          },
          {
            id: '2.5',
            q: "What's the difference between `command`, `shell`, and `raw` modules? When would you choose each?",
            a: "All three run something on the remote host, but with very different levels of shell interpretation and prerequisites:\n\n- **`command`** — runs the given program directly, **without** a shell. No pipes, redirects, `&&`, globbing, or environment variable expansion. Safer and preferred by default because there's no shell-injection surface and behavior is predictable.\n- **`shell`** — runs the command through `/bin/sh` on the remote host, so pipes, redirects, and shell operators work. Use it only when you genuinely need shell features (`|`, `>`, `$VAR`, `&&`) that `command` can't provide.\n- **`raw`** — sends the command over SSH with **no Python involved at all**. Use it to bootstrap a host that doesn't have Python yet (installing `python3` itself), or for talking to network devices/appliances with no Python interpreter.\n\nRule of thumb: reach for a dedicated module first, `command` second, `shell` only when you need shell syntax, and `raw` only for bootstrapping.",
            sample: [
              {
                file: 'examples',
                content: '# command: fine, no shell features needed\n- name: Check disk usage\n  command: df -h\n\n# shell: needs a pipe, command cannot do this\n- name: Count nginx error lines\n  shell: grep -c error /var/log/nginx/error.log | tee /tmp/count.txt\n\n# raw: target has no python yet\n- name: Bootstrap python3 on a bare host\n  raw: apt-get update && apt-get install -y python3',
              },
            ],
          },
          {
            id: '2.6',
            q: 'Explain the difference between `key: value` syntax and `key=value` syntax in module arguments. Are they interchangeable everywhere?',
            a: "`key: value` is standard **YAML mapping** syntax, used when a module's arguments are written as a nested block under the module key in a playbook. `key=value` is the older, space-separated **\"free-form\"/inline** syntax originally designed for **ad-hoc commands** (`-a \"name=nginx state=present\"`), and it's also still accepted inline in playbooks for simple modules.\n\nThey are **not interchangeable everywhere**:\n\n- `key=value` cannot represent nested structures — lists, dicts, or booleans-as-real-booleans are awkward or impossible (everything is effectively a string token).\n- Some modules (and Ansible features like `loop`, complex `vars`, `when` expressions) require real YAML data types, which only the `key: value` block form gives you cleanly.\n- `command`/`shell` treat a bare inline string as the literal command line, which is a different case again.\n\nIn modern playbooks, `key: value` YAML syntax is the recommended default; `key=value` mainly persists for ad-hoc one-liners.",
            sample: [
              {
                file: 'inline key=value (ad-hoc friendly)',
                content: '- name: Install nginx\n  apt: name=nginx state=present update_cache=yes',
              },
              {
                file: 'YAML key: value (recommended, supports lists/dicts)',
                content: '- name: Install packages\n  apt:\n    name:\n      - nginx\n      - git\n    state: present\n    update_cache: yes',
              },
            ],
          },
        ],
      },
      {
        level: 'Advanced',
        questions: [
          {
            id: '2.7',
            q: 'Why does Ansible discourage using `shell`/`command` for tasks that have a dedicated module (e.g., installing packages), even though both "work"? Discuss idempotency.',
            a: "**Idempotency** means running the same task twice produces the same end state, and the second run reports no change. Dedicated modules like `apt` or `user` first **check the current state** of the system and only act if it differs from the desired state — so re-running a playbook is safe and `changed` accurately reflects reality.\n\n`shell`/`command` have no concept of \"desired state\" — they just execute a command every single time and, by default, report `changed: true` unconditionally (because Ansible can't know whether `apt-get install nginx` actually changed anything just from its exit code). Consequences:\n\n- Playbooks become **non-idempotent**: re-running triggers unnecessary handler restarts, misleading change reports, and can duplicate side effects (e.g. appending a line to a file twice).\n- You lose **structured error handling** and **check-mode (`--check`) support** — dedicated modules can simulate \"would this change anything?\" without touching the system; a raw shell command cannot.\n- You lose portability — `apt` vs `yum` vs `dnf` differences, or OS-specific package naming, are abstracted away by the module but not by a raw shell command.\n\n`shell`/`command` remain appropriate for one-off operations with no matching module, but for anything with a dedicated module, that module is safer, more predictable, and self-documenting.",
            sample: [
              {
                file: 'non-idempotent (bad)',
                content: '- name: Install nginx\n  command: apt-get install -y nginx\n  # reports changed:true on every single run, even the 10th time',
              },
              {
                file: 'idempotent (good)',
                content: '- name: Install nginx\n  apt:\n    name: nginx\n    state: present\n  # reports changed:false once nginx is already installed',
              },
            ],
          },
          {
            id: '2.8',
            q: 'Write an ad-hoc command that uses `become` to restart the `nginx` service on all hosts in the `webservers` group, and explain what would happen if `become_method` were misconfigured.',
            a: "`ansible webservers -b -m service -a \"name=nginx state=restarted\" -i inventory`. `-b` (`--become`) enables privilege escalation for this task; by default that means `sudo`, but the method is configurable via `become_method` (in `ansible.cfg`, inventory vars, or `--become-method`).\n\nIf `become_method` were **misconfigured** — e.g. set to a typo'd value like `sudoo`, or set to a method (`su`, `pbrun`, `doas`, …) that isn't actually installed/configured on the target — Ansible fails **before the module even runs**, typically with an error like `Unsupported parameters for become plugin` or a connection-level failure such as `sudoo: command not found` surfacing as a non-zero exit from the escalation attempt. Every host in the play fails with `UNREACHABLE` or `FAILED`, and no actual restart happens anywhere — it fails closed, not silently.",
            files: ['inventory'],
            sample: [
              {
                file: 'command',
                content: '$ ansible webservers -b -m service -a "name=nginx state=restarted" -i inventory',
              },
              {
                file: 'ansible.cfg (misconfigured)',
                content: '[privilege_escalation]\nbecome = True\nbecome_method = sudoo   # typo — not a real become plugin',
              },
            ],
            out: 'web1.example.com | CHANGED => {\n    "changed": true,\n    "name": "nginx",\n    "state": "started"\n}\n\n# --- with become_method = sudoo (typo) instead ---\nweb1.example.com | FAILED! => {\n    "msg": "internal error: unable to resolve become plugin: sudoo"\n}',
          },
        ],
      },
    ],
  },
  {
    id: 3,
    icon: 'dns',
    title: 'Writing Ansible Inventories',
    blurb: 'Static INI/YAML inventories, groups, variable precedence, and dynamic inventory.',
    levels: [
      {
        level: 'Beginner',
        questions: [
          {
            id: '3.1',
            q: 'Write a minimal static INI-style inventory file with two hosts: `web1.example.com` and `web2.example.com`.',
            a: 'Bare hostnames with no group header are placed implicitly into the special `ungrouped` group (and, like every host, also belong to the implicit `all` group).',
            files: ['inventory.ini', 'inventory/hosts.ini'],
            sample: [
              {
                file: 'inventory.ini',
                content: 'web1.example.com\nweb2.example.com',
              },
              {
                file: 'command',
                content: '$ ansible all --list-hosts -i inventory.ini',
              },
            ],
            out: '  hosts (2):\n    web1.example.com\n    web2.example.com',
          },
          {
            id: '3.2',
            q: 'What is the purpose of the `[webservers]` group header in an inventory file?',
            a: 'It creates a named **group** so you can target `web1.example.com`/`web2.example.com` together as `webservers` in a play\'s `hosts:` line or an ad-hoc command, and so you can attach group-wide variables to them (via `[webservers:vars]` or `group_vars/webservers.yml`) instead of repeating settings per host.',
            files: ['inventory.ini'],
            sample: [
              {
                file: 'inventory.ini',
                content: '[webservers]\nweb1.example.com\nweb2.example.com',
              },
            ],
          },
          {
            id: '3.3',
            q: 'How do you specify a custom SSH port or user for a single host directly in the inventory file?',
            a: 'Append `key=value` host variables after the hostname on the same line: `ansible_port` for the SSH port and `ansible_user` for the connecting user. These are standard **behavioral inventory parameters** Ansible recognizes for the connection itself.',
            files: ['inventory.ini'],
            sample: [
              {
                file: 'inventory.ini',
                content: '[webservers]\nweb1.example.com ansible_port=2222 ansible_user=deploy\nweb2.example.com',
              },
            ],
            out: '$ ansible web1.example.com -m ping -i inventory.ini -vvv\n<web1.example.com> ESTABLISH SSH CONNECTION FOR USER: deploy\n<web1.example.com> SSH: ansible_port=2222',
          },
        ],
      },
      {
        level: 'Intermediate',
        questions: [
          {
            id: '3.4',
            q: 'Rewrite the following INI inventory as an equivalent YAML inventory:\n```ini\n[webservers]\nweb1.example.com\nweb2.example.com\n\n[dbservers]\ndb1.example.com\n```',
            a: 'YAML inventories express the same `all` → group → `hosts` structure explicitly as nested mappings. Each group gets a `hosts:` key whose children are the hostnames (as keys, mapping to `null`/`~` when they have no per-host vars).',
            files: ['inventory.yml'],
            sample: [
              {
                file: 'inventory.yml',
                content: 'all:\n  children:\n    webservers:\n      hosts:\n        web1.example.com:\n        web2.example.com:\n    dbservers:\n      hosts:\n        db1.example.com:',
              },
              {
                file: 'command',
                content: '$ ansible-inventory -i inventory.yml --graph',
              },
            ],
            out: '@all:\n  |--@ungrouped:\n  |--@webservers:\n  |  |--web1.example.com\n  |  |--web2.example.com\n  |--@dbservers:\n  |  |--db1.example.com',
          },
          {
            id: '3.5',
            q: 'What is the difference between `[webservers]` and `[webservers:children]` in an inventory file? Give an example using both.',
            a: '`[webservers]` lists **hosts** that belong directly to the `webservers` group. `[webservers:children]` instead lists **other groups** whose members should all be folded into `webservers` — it builds a group-of-groups hierarchy so you can target a broad umbrella (e.g. `production`) that automatically includes everything in its child groups, without re-listing hosts.',
            files: ['inventory.ini'],
            sample: [
              {
                file: 'inventory.ini',
                content: '[east_webservers]\nweb1.example.com\n\n[west_webservers]\nweb2.example.com\n\n[webservers:children]\neast_webservers\nwest_webservers',
              },
              {
                file: 'command',
                content: '$ ansible webservers --list-hosts -i inventory.ini',
              },
            ],
            out: '  hosts (2):\n    web1.example.com\n    web2.example.com',
          },
          {
            id: '3.6',
            q: 'How would you define a group variable (e.g., `ansible_user=deploy`) that applies to all hosts in the `webservers` group without repeating it on every line?',
            a: 'Add a `[webservers:vars]` section in INI (or a `vars:` block under the group in YAML). It\'s equivalent — and generally preferred for larger projects — to put the same content in `group_vars/webservers.yml`, which keeps the inventory file itself lean.',
            files: ['inventory.ini', 'group_vars/webservers.yml'],
            sample: [
              {
                file: 'inventory.ini (inline)',
                content: '[webservers]\nweb1.example.com\nweb2.example.com\n\n[webservers:vars]\nansible_user=deploy\nansible_port=2222',
              },
              {
                file: 'group_vars/webservers.yml (preferred at scale)',
                content: 'ansible_user: deploy\nansible_port: 2222',
              },
            ],
          },
        ],
      },
      {
        level: 'Advanced',
        questions: [
          {
            id: '3.7',
            q: 'Explain how Ansible merges variables when a host belongs to multiple groups with conflicting variable values. What determines precedence?',
            a: "Ansible builds an ordered merge, roughly least-specific to most-specific:\n\n1. `all` group vars\n2. Parent group vars, ordered by group depth (shallower groups first)\n3. Child group vars — a **child group's value beats its parent's** for the same key\n4. Among groups at the same depth, precedence follows **alphabetical order of group name** (last one alphabetically wins) unless a group's depth already decided it\n5. `host_vars` for that specific host — **always beats every group var**, regardless of group nesting\n\nSo the two levers are: **host-specific beats group-specific**, and **more deeply nested / more specific groups beat broader parent groups**. When two unrelated groups are genuinely tied, alphabetical order is the (somewhat arbitrary) tiebreaker — which is exactly why relying on that tiebreaker is fragile, and an explicit `host_vars` override is the reliable fix when a conflict actually matters.",
            sample: [
              {
                file: 'inventory.yml',
                content: 'all:\n  children:\n    datacenter_east:\n      vars:\n        backup_server: backup-east.example.com\n      children:\n        webservers:\n          hosts:\n            web1.example.com:\n              backup_server: backup-web1-override.example.com\n          vars:\n            backup_server: backup-webservers.example.com',
              },
            ],
            out: "Effective backup_server for web1.example.com:\n  backup-web1-override.example.com\n\n(host_vars on web1 beat the webservers group,\n which beats the parent datacenter_east group)",
          },
          {
            id: '3.8',
            q: "Write a dynamic inventory concept explanation: what problem do dynamic inventory scripts/plugins (e.g., for AWS EC2) solve that static inventories can't, and how does Ansible know to treat a file as executable/dynamic?",
            a: "**Problem solved:** in cloud/autoscaled environments, hosts come and go constantly — instances are created, terminated, and re-IP'd by autoscaling groups, spot fleets, or orchestrators. A static inventory file goes stale the moment topology changes, and hand-editing it doesn't scale. A **dynamic inventory** instead queries the live infrastructure (the AWS EC2 API, Azure, GCP, Kubernetes, etc.) **at the moment `ansible-playbook` runs**, so the host list and groupings (by tag, region, instance type...) always reflect current reality.\n\n**How Ansible decides a source is dynamic:** for a plain **script** (any language), Ansible checks whether the file has the **executable bit set**; if so, it runs it and expects JSON on stdout when called with `--list` (and `--host <name>` for per-host vars) — that's the whole contract. For a **plugin-based** source (the modern approach, e.g. `amazon.aws.aws_ec2`), Ansible recognizes it via a YAML file whose `plugin:` key names a registered inventory plugin — Ansible loads that plugin and lets it build the inventory in-process, no executable bit required.",
            files: ['inventory/aws_ec2.yml'],
            sample: [
              {
                file: 'inventory/aws_ec2.yml (modern plugin-based dynamic inventory)',
                content: 'plugin: amazon.aws.aws_ec2\nregions:\n  - us-east-1\nfilters:\n  tag:Environment: production\nkeyed_groups:\n  - key: tags.Role\n    prefix: role',
              },
              {
                file: 'command',
                content: '$ ansible-inventory -i inventory/aws_ec2.yml --graph',
              },
            ],
            out: '@all:\n  |--@aws_ec2:\n  |  |--i-0abc123def456 (web1, tag Role=web)\n  |  |--i-0fed654cba987 (web2, tag Role=web)\n  |--@role_web:\n  |  |--i-0abc123def456\n  |  |--i-0fed654cba987',
          },
          {
            id: '3.9',
            q: 'Debug this inventory — identify the syntax error and explain why it breaks:\n```ini\n[webservers]\nweb1.example.com ansible_user = deploy\n```',
            a: "The bug is the **spaces around the `=`**. INI-style inventory host variables must be written as a tight `key=value` token with **no surrounding whitespace** — Ansible's parser splits the line on whitespace to separate the hostname from its variable tokens, so `ansible_user = deploy` is read as **three separate tokens** (`ansible_user`, `=`, `deploy`) instead of one `key=value` pair.\n\nIn practice this means `ansible_user` isn't recognized as a valid `key=value` assignment at all, and Ansible either raises a parsing warning/error about a malformed host variable or silently fails to set `ansible_user`, leaving the host to connect with its default user instead of `deploy`. The fix is simply to remove the spaces.",
            files: ['inventory.ini'],
            sample: [
              {
                file: 'inventory.ini (broken)',
                content: '[webservers]\nweb1.example.com ansible_user = deploy',
              },
              {
                file: 'inventory.ini (fixed)',
                content: '[webservers]\nweb1.example.com ansible_user=deploy',
              },
            ],
            out: "$ ansible-inventory -i inventory.ini --host web1.example.com\n[WARNING]: Non-integer value for ansible_port\n# or, depending on version:\n[WARNING]: Skipping key (ansible_user) in group(webservers) as it is not a valid keyword\n\n# ansible_user never actually gets set to 'deploy' — connection\n# falls back to whatever the default remote user is.",
          },
        ],
      },
    ],
  },
  {
    id: 4,
    icon: 'checklist',
    title: 'Writing Ansible Playbooks',
    blurb: 'Plays, tasks, variables, handlers, blocks, roles, and templating.',
    levels: [
      {
        level: 'Beginner',
        questions: [
          {
            id: '4.1',
            q: 'What are the four required or common top-level keys in a basic playbook (`hosts`, `tasks`, etc.)? Write a playbook that installs `git` on all hosts.',
            a: "Technically only `hosts` and `tasks` are required for a play to run, but in practice a well-formed play almost always includes four keys:\n\n- **`name`** — a human-readable description of the play (shown in output).\n- **`hosts`** — which inventory group/host(s) the play targets.\n- **`become`** — whether tasks need privilege escalation (very common, though not strictly required).\n- **`tasks`** — the actual list of work to perform.",
            files: ['install_git.yml'],
            sample: [
              {
                file: 'install_git.yml',
                content: '---\n- name: Install git on all hosts\n  hosts: all\n  become: true\n  tasks:\n    - name: Ensure git is installed\n      apt:\n        name: git\n        state: present',
              },
              {
                file: 'command',
                content: '$ ansible-playbook install_git.yml -i inventory.ini',
              },
            ],
            out: 'PLAY [Install git on all hosts] ***********************************\n\nTASK [Gathering Facts] *********************************************\nok: [web1.example.com]\n\nTASK [Ensure git is installed] *************************************\nchanged: [web1.example.com]\n\nPLAY RECAP **********************************************************\nweb1.example.com : ok=2 changed=1 unreachable=0 failed=0 skipped=0',
          },
          {
            id: '4.2',
            q: 'What does `become: true` do in a playbook, and when is it necessary?',
            a: 'It tells Ansible to run the task (or every task in the play, if set at the play level) with **privilege escalation** — by default via `sudo` — instead of as the SSH-connecting user. It\'s necessary whenever a task needs root/administrative rights: installing system packages, managing services, writing to system directories like `/etc` or `/var/www`, or managing users/groups. Tasks that only touch files owned by the connecting user (e.g. deploying to their own home directory) don\'t need it.',
            sample: [
              {
                file: 'playbook.yml',
                content: '- name: Restart a system service (needs root)\n  hosts: webservers\n  tasks:\n    - name: Restart nginx\n      service:\n        name: nginx\n        state: restarted\n      become: true   # only this task escalates, rest of the play does not',
              },
            ],
          },
          {
            id: '4.3',
            q: 'Write a single-task play that copies a file from `files/index.html` to `/var/www/html/index.html` on target hosts.',
            a: "The `copy` module's `src` is resolved relative to the playbook's `files/` directory by convention, and `dest` is the absolute path on the remote host.",
            files: ['deploy_index.yml', 'files/index.html'],
            sample: [
              {
                file: 'deploy_index.yml',
                content: '---\n- name: Deploy the site homepage\n  hosts: webservers\n  become: true\n  tasks:\n    - name: Copy index.html to the webroot\n      copy:\n        src: files/index.html\n        dest: /var/www/html/index.html\n        owner: www-data\n        group: www-data\n        mode: "0644"',
              },
              {
                file: 'files/index.html',
                content: '<!doctype html>\n<html>\n  <body><h1>Hello from Ansible</h1></body>\n</html>',
              },
            ],
            out: 'TASK [Copy index.html to the webroot] ******************************\nchanged: [web1.example.com]\n\nPLAY RECAP **********************************************************\nweb1.example.com : ok=2 changed=1 unreachable=0 failed=0 skipped=0',
          },
        ],
      },
      {
        level: 'Intermediate',
        questions: [
          {
            id: '4.4',
            q: 'Write a playbook with two plays: one that targets `webservers` and installs `nginx`, and another that targets `dbservers` and installs `postgresql`.',
            a: 'A playbook file is simply a **list of plays**; each play has its own `hosts:` target, so different groups can receive completely different work in one run, in top-to-bottom order.',
            files: ['site.yml'],
            sample: [
              {
                file: 'site.yml',
                content: '---\n- name: Configure web tier\n  hosts: webservers\n  become: true\n  tasks:\n    - name: Install nginx\n      apt:\n        name: nginx\n        state: present\n\n- name: Configure database tier\n  hosts: dbservers\n  become: true\n  tasks:\n    - name: Install postgresql\n      apt:\n        name: postgresql\n        state: present',
              },
            ],
            out: 'PLAY [Configure web tier] ******************************************\nTASK [Install nginx] ************************************************\nchanged: [web1.example.com]\n\nPLAY [Configure database tier] *************************************\nTASK [Install postgresql] *******************************************\nchanged: [db1.example.com]\n\nPLAY RECAP **********************************************************\ndb1.example.com  : ok=2 changed=1 unreachable=0 failed=0 skipped=0\nweb1.example.com : ok=2 changed=1 unreachable=0 failed=0 skipped=0',
          },
          {
            id: '4.5',
            q: 'What is the difference between `vars`, `vars_files`, and `group_vars`/`host_vars` for supplying variables to a playbook?',
            a: "- **`vars`** — variables defined **inline**, directly in the playbook (or role/task). Good for values specific to that one playbook and small in number.\n- **`vars_files`** — an explicit `include` of one or more **external YAML files** listed by path in the playbook; useful for separating secrets or large variable sets while still making the dependency visible and controllable (you choose exactly when/if it loads, and it can be conditional).\n- **`group_vars`/`host_vars`** — loaded **automatically** by Ansible based on inventory group/host membership, with no reference needed in the playbook at all. Best for environment- or host-specific values that should apply everywhere that host/group is used, across many playbooks.\n\nPrecedence (low → high, roughly): `group_vars/all` → `group_vars/<group>` → `host_vars/<host>` → play `vars` → `vars_files` → task-level `vars`, though `vars_files`/`vars` at the play level are commonly treated as intermediate — the key practical point is that anything loaded closer to the specific task/host tends to win.",
            files: ['site.yml', 'vars/app.yml', 'group_vars/webservers.yml'],
            sample: [
              {
                file: 'site.yml',
                content: "- hosts: webservers\n  vars:\n    app_port: 8080\n  vars_files:\n    - vars/app.yml\n  tasks:\n    - debug:\n        msg: \"Deploying {{ app_name }} on port {{ app_port }}\"",
              },
              {
                file: 'vars/app.yml',
                content: 'app_name: storefront',
              },
              {
                file: 'group_vars/webservers.yml',
                content: 'app_port: 80   # overridden by the play-level vars: app_port: 8080 above',
              },
            ],
          },
          {
            id: '4.6',
            q: 'Explain `notify` and `handlers`. Write a task that installs and configures nginx, notifying a handler that restarts the service only when the config file changes.',
            a: "A **handler** is a task that only runs when explicitly triggered via `notify`, and — crucially — it runs **at most once**, **after all tasks in the play finish** (not immediately), even if multiple tasks notify it. This avoids restarting a service five times because five separate config tasks all touched it; it restarts once, after everything is in place.\n\n`notify` is attached to a normal task and only fires the handler when that task reports `changed: true` — so if the config file is already correct and nothing changes, the handler never runs at all.",
            files: ['playbook.yml'],
            sample: [
              {
                file: 'playbook.yml',
                content: "- hosts: webservers\n  become: true\n  tasks:\n    - name: Install nginx\n      apt:\n        name: nginx\n        state: present\n\n    - name: Deploy nginx configuration\n      template:\n        src: nginx.conf.j2\n        dest: /etc/nginx/nginx.conf\n      notify: Restart nginx\n\n  handlers:\n    - name: Restart nginx\n      service:\n        name: nginx\n        state: restarted",
              },
            ],
            out: 'TASK [Deploy nginx configuration] **********************************\nchanged: [web1.example.com]\n\nRUNNING HANDLER [Restart nginx] ************************************\nchanged: [web1.example.com]\n\n# On the NEXT run, if nginx.conf.j2 renders identically:\nTASK [Deploy nginx configuration] **********************************\nok: [web1.example.com]\n# handler is NOT triggered — no "RUNNING HANDLER" line appears',
          },
          {
            id: '4.7',
            q: 'What does `register` do? Write a task that registers the output of a command and uses it in a subsequent `debug` task.',
            a: "`register` captures a task's full result object (`stdout`, `stderr`, `rc`, `changed`, plus module-specific fields) into a named variable, so later tasks in the same play can inspect or act on it — check exit codes, branch with `when`, or just print it for visibility.",
            files: ['playbook.yml'],
            sample: [
              {
                file: 'playbook.yml',
                content: '- hosts: webservers\n  tasks:\n    - name: Check current kernel version\n      command: uname -r\n      register: kernel_check\n\n    - name: Show the kernel version\n      debug:\n        msg: "Kernel on {{ inventory_hostname }} is {{ kernel_check.stdout }}"',
              },
            ],
            out: 'TASK [Check current kernel version] ********************************\nchanged: [web1.example.com]\n\nTASK [Show the kernel version] *************************************\nok: [web1.example.com] => {\n    "msg": "Kernel on web1.example.com is 6.5.0-generic"\n}',
          },
        ],
      },
      {
        level: 'Advanced',
        questions: [
          {
            id: '4.8',
            q: 'Explain the difference between `when`, `failed_when`, and `changed_when`. Write an example task using all three meaningfully.',
            a: "- **`when`** — a precondition; if false, the task is **skipped entirely** (it never runs, and reports `skipped`, not `ok`/`changed`).\n- **`changed_when`** — overrides how Ansible decides whether the task's outcome counts as `changed`, regardless of the module's own default logic. Essential for `command`/`shell`, which otherwise always report `changed: true`.\n- **`failed_when`** — overrides how Ansible decides whether the task counts as a **failure**, independent of the command's exit code. Lets you treat a nonzero exit as fine, or a zero exit with a bad message as a failure.\n\nAll three are commonly needed together specifically because `command`/`shell` give none of this analysis for free — they just run and return an exit code and output text.",
            files: ['playbook.yml'],
            sample: [
              {
                file: 'playbook.yml',
                content: '- name: Reload app config only if the service is actually running\n  command: myapp-ctl reload\n  register: reload_result\n  when: myapp_should_be_running\n  changed_when: "\'reloaded configuration\' in reload_result.stdout"\n  failed_when: >\n    reload_result.rc not in [0, 2] or\n    \'FATAL\' in reload_result.stderr',
              },
            ],
            out: '# myapp_should_be_running == false:\nskipping: [web1.example.com]\n\n# service running, config actually reloaded:\nchanged: [web1.example.com]\n\n# service running, but rc==2 ("nothing to reload") and no FATAL in stderr:\nok: [web1.example.com]     # not marked changed, not marked failed',
          },
          {
            id: '4.9',
            q: 'What is the purpose of `block`, `rescue`, and `always` in a playbook? Write an example that attempts to install a package, falls back to a different method on failure, and always logs the attempt.',
            a: "This trio gives playbooks **try/except/finally**-style error handling:\n\n- **`block`** — groups tasks together so they can share `when`/`become`/error-handling as one unit.\n- **`rescue`** — runs **only if a task in the `block` fails**, letting you recover or fall back to an alternative approach instead of aborting the whole play.\n- **`always`** — runs **regardless of success or failure** of the block/rescue — ideal for cleanup or logging that must happen either way.",
            files: ['playbook.yml'],
            sample: [
              {
                file: 'playbook.yml',
                content: "- hosts: webservers\n  become: true\n  tasks:\n    - name: Install package with fallback and logging\n      block:\n        - name: Try installing via apt\n          apt:\n            name: some-tricky-package\n            state: present\n\n      rescue:\n        - name: Fall back to installing from a local .deb\n          apt:\n            deb: /opt/pkgs/some-tricky-package_1.0.deb\n\n      always:\n        - name: Log the install attempt\n          lineinfile:\n            path: /var/log/ansible-installs.log\n            line: \"{{ ansible_date_time.iso8601 }} - install attempt for some-tricky-package on {{ inventory_hostname }}\"\n            create: true",
              },
            ],
            out: 'TASK [Try installing via apt] **************************************\nfatal: [web1.example.com]: FAILED! => {"msg": "No package matching..."}\n...ignoring, entering rescue\n\nTASK [Fall back to installing from a local .deb] ********************\nchanged: [web1.example.com]\n\nTASK [Log the install attempt] **************************************\nchanged: [web1.example.com]\n\nPLAY RECAP **********************************************************\nweb1.example.com : ok=3 changed=2 unreachable=0 failed=0 skipped=0',
          },
          {
            id: '4.10',
            q: 'How do `roles` differ from simply including task files with `import_tasks`/`include_tasks`? When would you refactor a playbook into a role?',
            a: "`import_tasks`/`include_tasks` just splice a flat **list of tasks** from another file into the current play — nothing more. A **role** is a full, self-contained package with its own conventionally-named directories for tasks, handlers, templates, files, variable defaults, and metadata (including declared dependencies on other roles), and it's independently distributable/reusable (e.g. via Ansible Galaxy) across entirely different playbooks and projects.\n\nRefactor into a role once a chunk of automation: needs its **own variables with sane defaults**, has **handlers**, ships **templates/static files**, is genuinely **reused across multiple playbooks or projects**, or has simply grown complex enough that bundling it as a coherent, testable, shareable unit beats a loose pile of imported task files.",
            files: ['roles/nginx/tasks/main.yml', 'roles/nginx/handlers/main.yml', 'roles/nginx/defaults/main.yml'],
            sample: [
              {
                file: 'before: loose task import',
                content: '- hosts: webservers\n  tasks:\n    - import_tasks: tasks/install_nginx.yml\n    - import_tasks: tasks/configure_nginx.yml',
              },
              {
                file: 'after: refactored into a role',
                content: '- hosts: webservers\n  roles:\n    - nginx   # brings its own tasks, handlers, templates, and defaults',
              },
            ],
          },
          {
            id: '4.11',
            q: "Explain the difference between `import_tasks`/`import_playbook` (static) and `include_tasks`/`include_role` (dynamic). Give a scenario where the choice actually changes playbook behavior, not just style.",
            a: "**Static (`import_*`)**: processed at **playbook parse time**, before any host is contacted and before facts are gathered. All imported tasks are fully expanded up front — so tags, `--list-tasks`, and `--start-at-task` see every task individually, and loops over imports work like static duplication.\n\n**Dynamic (`include_*`)**: resolved **at runtime**, task-by-task as the play actually executes — after facts have been gathered. This means the file path can depend on a variable only known at runtime (like a gathered fact), and inclusion can be truly conditional per host without Ansible needing to know in advance which file each host will use.\n\n**Concrete behavior-changing scenario:** picking an OS-specific task file by gathered fact:\n\n```\n- include_tasks: \"{{ ansible_facts.os_family }}.yml\"\n```\n\nUsing `import_tasks` here is unreliable/wrong: `import_tasks` is resolved at parse time, **before facts are gathered**, so `ansible_facts.os_family` isn't populated yet and the import can't correctly resolve a fact-dependent filename. `include_tasks` defers resolution until the task actually runs, by which point facts exist — so each host correctly loads its own `Debian.yml` or `RedHat.yml`. This is a real functional difference, not just style.",
            files: ['tasks/main.yml', 'tasks/Debian.yml', 'tasks/RedHat.yml'],
            sample: [
              {
                file: 'tasks/main.yml',
                content: '- name: Load OS-specific tasks (must be dynamic — depends on a gathered fact)\n  include_tasks: "{{ ansible_facts.os_family }}.yml"',
              },
              {
                file: 'tasks/Debian.yml',
                content: '- name: Install nginx (Debian family)\n  apt:\n    name: nginx\n    state: present',
              },
              {
                file: 'tasks/RedHat.yml',
                content: '- name: Install nginx (RedHat family)\n  dnf:\n    name: nginx\n    state: present',
              },
            ],
          },
          {
            id: '4.12',
            q: 'Write a playbook task using a Jinja2 template (`template` module) that renders `nginx.conf.j2` with a variable `max_connections`, and explain how Ansible decides where `nginx.conf.j2` should live on disk.',
            a: "The `template` module renders a `.j2` file through Jinja2 (substituting variables, running loops/conditionals) and writes the result to `dest` on the remote host. Ansible resolves the **source path** the same way it resolves `copy`'s `src` and a role's other file lookups: if the task is inside a **role**, it looks in that role's `templates/` directory by convention; if it's a plain playbook task (no role), it looks in a `templates/` directory **next to the playbook file**. In both cases you only give the filename (or a relative path within `templates/`) — you don't need the full path.",
            files: ['templates/nginx.conf.j2', 'playbook.yml'],
            sample: [
              {
                file: 'playbook.yml',
                content: '- hosts: webservers\n  become: true\n  vars:\n    max_connections: 1024\n  tasks:\n    - name: Render nginx.conf from template\n      template:\n        src: nginx.conf.j2      # looked up in ./templates/ next to this playbook\n        dest: /etc/nginx/nginx.conf\n      notify: Restart nginx\n\n  handlers:\n    - name: Restart nginx\n      service:\n        name: nginx\n        state: restarted',
              },
              {
                file: 'templates/nginx.conf.j2',
                content: 'events {\n    worker_connections {{ max_connections }};\n}\n\nhttp {\n    server {\n        listen 80;\n        server_name _;\n    }\n}',
              },
            ],
            out: 'TASK [Render nginx.conf from template] *****************************\nchanged: [web1.example.com]\n\n# resulting /etc/nginx/nginx.conf on the remote host:\nevents {\n    worker_connections 1024;\n}\n...',
          },
        ],
      },
    ],
  },
  {
    id: 5,
    icon: 'bug_report',
    title: 'Debugging Playbook Syntax Errors',
    blurb: 'From --syntax-check to -vvv: finding and fixing YAML, parsing, and runtime failures.',
    levels: [
      {
        level: 'Beginner',
        questions: [
          {
            id: '5.1',
            q: "What command do you run to check a playbook's syntax without executing it?",
            a: '`ansible-playbook <playbook>.yml --syntax-check`. It parses the YAML and validates overall playbook structure **without connecting to any hosts or running any tasks** — the fastest possible feedback loop while writing a playbook.',
            sample: [
              {
                file: 'command',
                content: '$ ansible-playbook site.yml --syntax-check',
              },
            ],
            out: 'playbook: site.yml',
          },
          {
            id: '5.2',
            q: 'You get the error `while parsing a block mapping... did not find expected key`. What category of mistake usually causes this in YAML?',
            a: "It's almost always an **indentation/structure mistake in a mapping** (a set of `key: value` pairs) — most commonly: two keys of what should be the same mapping sitting at **different indentation levels**, a missing colon after a key, or a value that itself looks like a new key because it wasn't quoted/indented correctly. The parser expected the next line to either continue the current mapping at the same indent or clearly close it, and instead hit something structurally ambiguous.",
            sample: [
              {
                file: 'broken.yml',
                content: 'tasks:\n  - name: Install nginx\n    apt:\n      name: nginx\n    state: present   # <- wrong indent: looks like a new key of "apt", not a sibling of "apt"',
              },
            ],
            out: "ERROR! Syntax Error while loading YAML.\nwhile parsing a block mapping\n  in \"broken.yml\", line 2, column 5\ndid not find expected key\n  in \"broken.yml\", line 5, column 5",
          },
          {
            id: '5.3',
            q: 'What does the `--check` flag do, and how is it different from `--syntax-check`?',
            a: '`--syntax-check` only validates that the playbook **parses correctly** — it never contacts hosts. `--check` ("dry run") actually **connects to hosts and simulates each task**, reporting what *would* change without actually changing anything (where the module supports check mode). They answer different questions: "is this playbook well-formed?" vs. "if I ran this for real, what would happen?"',
            sample: [
              {
                file: 'command',
                content: '$ ansible-playbook site.yml --check --diff',
              },
            ],
            out: 'TASK [Ensure git is installed] *************************************\nchanged: [web1.example.com]   # would install git, but nothing was actually installed\n\nPLAY RECAP **********************************************************\nweb1.example.com : ok=2 changed=1 unreachable=0 failed=0 skipped=0',
          },
        ],
      },
      {
        level: 'Intermediate',
        questions: [
          {
            id: '5.4',
            q: 'Debug this task and explain the error it would raise:\n```yaml\ntasks:\n  - name: Install nginx\n    apt:\n    apt:\n      name: nginx\n      state: present\n```',
            a: "As given, `apt:` appears with **no value** on its own line, and `name:`/`state:` are indented at the **same level as `apt:`** instead of nested underneath it — so they become extra keys of the *task* (siblings of `name` and `apt`), not arguments of the `apt` module. Ansible ends up seeing what looks like two \"action\"-shaped keys / stray top-level task attributes it doesn't recognize, and raises an error rather than silently guessing — commonly `ERROR! conflicting action statements` or `'state' is not a valid attribute for a Task`, and even if it didn't error, `apt` would run with **no arguments at all**, so nginx would never actually be installed.\n\n**Fix:** indent `name:` and `state:` one level deeper, underneath `apt:`, so they're recognized as that module's arguments.",
            files: ['broken_task.yml', 'fixed_task.yml'],
            sample: [
              {
                file: 'broken_task.yml',
                content: 'tasks:\n  - name: Install nginx\n    apt:\n    name: nginx\n    state: present',
              },
              {
                file: 'fixed_task.yml',
                content: 'tasks:\n  - name: Install nginx\n    apt:\n      name: nginx\n      state: present',
              },
            ],
            out: "ERROR! conflicting action statements: ansible.builtin.apt, state\nThe error appears to be in 'broken_task.yml': line 2, column 5.",
          },
          {
            id: '5.5',
            q: "Debug this playbook and explain why Ansible would refuse to run it:\n```yaml\n- hosts: webservers\n  tasks:\n  - name: Start service\n      service:\n        name: nginx\n        state: started\n```",
            a: "`service:` is indented **one level deeper than `name:`**, even though they must be **siblings** — both are keys of the same task mapping (the one introduced by `- name: Start service`). By over-indenting `service:`, YAML tries to interpret it as a child of the scalar value `\"Start service\"`, which isn't a mapping at all — that's structurally invalid, so YAML parsing fails before Ansible-level validation ever happens.\n\n**Fix:** align `service:` at exactly the same indentation as `name:` within that list item.",
            files: ['broken_playbook.yml', 'fixed_playbook.yml'],
            sample: [
              {
                file: 'broken_playbook.yml',
                content: '- hosts: webservers\n  tasks:\n  - name: Start service\n      service:\n        name: nginx\n        state: started',
              },
              {
                file: 'fixed_playbook.yml',
                content: '- hosts: webservers\n  tasks:\n    - name: Start service\n      service:\n        name: nginx\n        state: started',
              },
            ],
            out: "ERROR! Syntax Error while loading YAML.\nmapping values are not allowed in this context\nThe error appears to be in 'broken_playbook.yml': line 4, column 15.",
          },
          {
            id: '5.6',
            q: "What's wrong with this variable reference, and what error would it produce at runtime versus at parse time?\n```yaml\n- name: Show value\n  debug:\n    msg: \"Value is {{ my_var }\"\n```",
            a: "The Jinja2 expression is missing its **second closing brace** — it should be `{{ my_var }}`, not `{{ my_var }`. Because the whole thing is inside a quoted YAML string, **YAML parsing succeeds without complaint** (it's just a valid string as far as YAML is concerned) — so `--syntax-check` will not catch this. The failure only surfaces **at runtime**, when Ansible tries to Jinja2-render that string while executing the task, raising a template error such as `template error while templating string: unexpected end of template` (or similar \"expected token\" message) — a runtime templating error, not a parse-time YAML error.",
            files: ['broken_debug.yml', 'fixed_debug.yml'],
            sample: [
              {
                file: 'broken_debug.yml',
                content: '- name: Show value\n  debug:\n    msg: "Value is {{ my_var }"',
              },
              {
                file: 'fixed_debug.yml',
                content: '- name: Show value\n  debug:\n    msg: "Value is {{ my_var }}"',
              },
            ],
            out: "$ ansible-playbook broken_debug.yml --syntax-check\nplaybook: broken_debug.yml    # passes — YAML itself is valid\n\n$ ansible-playbook broken_debug.yml\nfatal: [web1.example.com]: FAILED! => {\"msg\": \"template error while templating string: unexpected end of template. Jinja was looking for the following tags: 'end of print statement'.\"}",
          },
          {
            id: '5.7',
            q: 'Explain the difference between a YAML syntax error, an Ansible parsing error (bad module arguments), and a runtime task failure. How does the error output differ for each?',
            a: "Three distinct failure layers, checked in this order:\n\n1. **YAML syntax error** — the file isn't even valid YAML (bad indentation, missing colon, unbalanced quotes). Caught immediately, **before Ansible-specific logic runs at all**. Output: a generic YAML-parser traceback mentioning \"while parsing...\", a line/column, and no mention of hosts or tasks yet.\n2. **Ansible parsing error** — the YAML is valid, but violates Ansible's own structural rules: an unknown attribute on a Play/Task, conflicting module keys, an unsupported parameter for a module. Caught **while Ansible loads the playbook**, still before contacting any hosts. Output: an `ERROR!` line naming the specific invalid attribute/module and a file/line reference.\n3. **Runtime task failure** — the playbook is completely well-formed and starts running, but a task fails **while actually executing against a host** — package not found, permission denied, unreachable host, failed `when`/`failed_when` logic. Output: per-host `fatal: [hostname]: FAILED! =>` (or `UNREACHABLE!`) with a JSON-ish payload of module-specific detail, appearing interleaved with the tasks that already succeeded on other hosts.\n\nThe practical tell: (1) and (2) happen instantly, before `PLAY [...]` output even appears for real execution; (3) happens mid-run, per host, after other tasks/hosts may have already succeeded.",
            sample: [
              {
                file: '1. YAML syntax error',
                content: "ERROR! Syntax Error while loading YAML.\nmapping values are not allowed in this context\nThe error appears to be in 'site.yml': line 4, column 15.",
              },
              {
                file: '2. Ansible parsing error',
                content: "ERROR! 'state' is not a valid attribute for a Task\nThe error appears to be in 'site.yml': line 3, column 5.",
              },
              {
                file: '3. Runtime task failure',
                content: 'TASK [Install nginx] ************************************************\nfatal: [web1.example.com]: FAILED! => {"changed": false, "msg": "No package matching \'ngnix\' is available"}',
              },
            ],
          },
        ],
      },
      {
        level: 'Advanced',
        questions: [
          {
            id: '5.8',
            q: "You run a playbook and get `ERROR! 'foo' is not a valid attribute for a Play`. What does this tell you about where to look, and what are common causes (typo vs. wrong indentation level vs. deprecated key)?",
            a: "It tells you the offending key `foo` is sitting at the **play level** — directly under the `- hosts: ...` list item, as a sibling of `hosts`/`tasks`/`become` — rather than inside `tasks:`, a module's arguments, or elsewhere. So look at the **top-level keys of that specific play**, not deeper in the task list.\n\nCommon root causes:\n\n- **Typo** in a legitimate play keyword, e.g. `task:` instead of `tasks:`, or `host:` instead of `hosts:` — Ansible doesn't recognize the misspelled key as anything, so it reports it as invalid.\n- **Wrong indentation level** — a key that was meant to live inside a task (or inside `vars:`) accidentally sits flush with `hosts:`/`tasks:` instead, so Ansible reads it as a play attribute instead of where you intended.\n- **Deprecated/removed keyword** — an old key from a previous Ansible version that no longer exists at the play level (or was moved elsewhere), left over from a copy-pasted example or an upgrade.",
            sample: [
              {
                file: 'broken.yml (typo: task: instead of tasks:)',
                content: '- hosts: webservers\n  task:\n    - name: Install nginx\n      apt:\n        name: nginx\n        state: present',
              },
            ],
            out: "ERROR! 'task' is not a valid attribute for a Play\nThe error appears to be in 'broken.yml': line 2, column 3.",
          },
          {
            id: '5.9',
            q: "A playbook runs but a task silently reports `ok` instead of `changed` when you expected a real change. Walk through how you'd debug whether this is a `changed_when` issue, an idempotency issue in the module, or a logic error in `when`.",
            a: "Work outward from the fastest checks to the slowest:\n\n1. **Rule out `when` first.** If the task were actually being skipped, you'd see `skipping:`, not `ok:` — so if the recap really shows `ok`, the task *did* run; this immediately rules out a `when` condition silently preventing execution (that would show a different status entirely). Still worth double-checking the condition's logic isn't inverted if you're unsure what actually ran.\n2. **Check for an explicit `changed_when` override** on the task. If someone set `changed_when: false` (or a condition that evaluates false when it shouldn't), the task can genuinely change the system but be **forced** to report `ok`. This is the most common cause when `command`/`shell` are involved.\n3. **Rerun with `--check --diff` and `-vvv`.** `--diff` shows an actual before/after comparison where the module supports it; `-vvv` shows the raw module return payload (`changed: true/false` as the module itself computed it, plus fields like `msg`/`stdout`) *before* any `changed_when` override is applied — this tells you whether the module itself thinks nothing changed (idempotency correctly detecting no-op) versus something overriding a real change to `ok`.\n4. **If the module itself says `changed: false`** and nothing looks overridden, treat it as the module correctly detecting that the system already matches the desired state — i.e., not a bug, but idempotency working as intended (double check your assumption about what state you expected).",
            sample: [
              {
                file: 'command',
                content: '$ ansible-playbook site.yml --check --diff -vvv',
              },
            ],
            out: "TASK [Reload app config] ********************************************\nok: [web1.example.com] => {\n    \"changed\": false,\n    \"cmd\": \"myapp-ctl reload\",\n    \"stdout\": \"reloaded configuration\",\n    ...\n}\n# raw module result shows changed:false was FORCED — the process actually\n# printed \"reloaded configuration\", meaning the changed_when expression on\n# this task is wrong (or missing) and should be checking that string.",
          },
          {
            id: '5.10',
            q: 'Use `ansible-playbook -vvv` output conceptually: what additional information does increasing verbosity reveal, and at what verbosity level do you start seeing the actual module arguments sent to the remote host?',
            a: "Roughly, each `-v` peels back another layer:\n\n- **`-v`** — per-task result detail beyond the one-line summary: full module return data, `changed`/`msg` payloads.\n- **`-vv`** — adds more task execution context, including some file/line info about where tasks came from.\n- **`-vvv`** — the level where you start seeing **the actual module arguments serialized and sent to the remote host** (the JSON payload transferred and executed there), plus the SSH command invocations Ansible constructs, temp directory/file paths created on the remote host, and Python interpreter discovery details.\n- **`-vvvv`** — adds low-level connection plugin debugging, including raw SSH client debug output — useful for diagnosing connection/auth failures rather than task logic.\n\nSo: `-vvv` is the practical \"show me exactly what was sent to the module\" level most people reach for when debugging *why a module behaved the way it did*.",
            sample: [
              {
                file: 'command',
                content: '$ ansible-playbook site.yml -vvv',
              },
            ],
            out: '<web1.example.com> SSH: EXEC ssh -C -o ControlMaster=auto ... web1.example.com \'/bin/sh -c ...\'\n<web1.example.com> (0, b\'\\n{"invocation": {"module_args": {"name": "nginx", "state": "present", "update_cache": false, ...}}, "changed": true}\\n\', b\'\')',
          },
          {
            id: '5.11',
            q: 'Debug this jinja templating error — identify the issue and rewrite it correctly:\n```yaml\n- name: Set fact\n  set_fact:\n    full_path: "{{ base_dir }/subdir"\n```',
            a: "Same class of bug as the earlier `debug` example: the Jinja2 expression `{{ base_dir }` is missing its **closing double-brace** — it needs `}}`, not a single `}`. As written, YAML happily accepts the string (it's just text to YAML), but Jinja2 fails at render time because `{{ base_dir }` is an unterminated expression.\n\n**Fix:** `\"{{ base_dir }}/subdir\"`.",
            files: ['broken_fact.yml', 'fixed_fact.yml'],
            sample: [
              {
                file: 'broken_fact.yml',
                content: '- name: Set fact\n  set_fact:\n    full_path: "{{ base_dir }/subdir"',
              },
              {
                file: 'fixed_fact.yml',
                content: '- name: Set fact\n  set_fact:\n    full_path: "{{ base_dir }}/subdir"',
              },
            ],
            out: "fatal: [web1.example.com]: FAILED! => {\"msg\": \"template error while templating string: unexpected end of template. Jinja was looking for the following tags: 'end of print statement'. The innermost block that needs to be closed is 'print'.\"}\n\n# after the fix, with base_dir=/opt/app:\nok: [web1.example.com] => {\n    \"ansible_facts\": {\"full_path\": \"/opt/app/subdir\"}\n}",
          },
          {
            id: '5.12',
            q: "A colleague's playbook fails with `AnsibleUndefinedVariable: 'items' is undefined` on a loop task. Given Ansible's version history around `with_items` vs `loop`, what's the most likely cause, and how would you fix it?",
            a: "The task almost certainly uses the modern **`loop:`** keyword but the task body still refers to **`{{ items }}`** (plural) instead of **`{{ item }}`** (singular) — a habit carried over incorrectly, since neither `loop` nor `with_items` ever exposed the current element as `items`; both always use the singular `item` (unless `loop_control.loop_var` renames it). The colleague likely copy-pasted from an older or unrelated example and mistyped/misremembered the variable name, or confused the *keyword* `with_items` with the *loop variable* it produces.\n\n**Fix:** reference `{{ item }}` inside the task, or — if nested loops make `item` ambiguous/shadowed — explicitly rename it with `loop_control: { loop_var: my_item }` and reference `{{ my_item }}` instead.",
            files: ['broken_loop.yml', 'fixed_loop.yml'],
            sample: [
              {
                file: 'broken_loop.yml',
                content: '- name: Install several packages\n  apt:\n    name: "{{ items }}"   # WRONG — no such variable exists\n    state: present\n  loop:\n    - git\n    - curl\n    - vim',
              },
              {
                file: 'fixed_loop.yml',
                content: '- name: Install several packages\n  apt:\n    name: "{{ item }}"    # correct — loop always exposes "item"\n    state: present\n  loop:\n    - git\n    - curl\n    - vim',
              },
            ],
            out: 'TASK [Install several packages] ************************************\nfatal: [web1.example.com]: FAILED! => {"msg": "The task includes an option with an undefined variable. The error was: \'items\' is undefined"}\n\n# after the fix:\nchanged: [web1.example.com] => (item=git)\nchanged: [web1.example.com] => (item=curl)\nchanged: [web1.example.com] => (item=vim)',
          },
        ],
      },
    ],
  },
  {
    id: 6,
    icon: 'router',
    title: 'Connecting to Cisco Devices',
    blurb: 'Inventory, connection types, and credentials for network_cli/netconf against IOS, IOS-XE, and NX-OS.',
    levels: [
      {
        level: 'Beginner',
        questions: [
          {
            id: '6.1',
            q: "Why can't Ansible use its default SSH + Python `ControlPersist` connection method directly against most Cisco IOS devices the way it does against Linux hosts?",
            a: "Ansible's default `ssh` connection plugin assumes the remote end has a **Python interpreter** it can copy small JSON-returning modules to and execute — that's how `apt`, `copy`, `service`, etc. all work under the hood. Cisco IOS (and most traditional network OSes) run on embedded systems with **no Python interpreter at all**; the only thing on the other end of SSH is the device's own CLI shell.\n\nInstead of trying to execute Python, Ansible has to fall back to treating the connection as an **interactive CLI session**: log in, land at the `>`/`#` prompt, send text commands, and scrape the text that comes back — very different from copying and running a module file. That's exactly what the `network_cli` connection plugin (and the `ios_*`/`nxos_*`/`ios_config`-style \"network modules\") are built to do, rather than the generic `ssh` plugin.",
          },
          {
            id: '6.2',
            q: 'What connection type must you set (`ansible_connection`) to manage a Cisco IOS device over SSH using network modules?',
            a: "`ansible_connection: network_cli`. This tells Ansible to use the CLI-scraping connection plugin instead of the default `ssh` plugin, which in turn requires you to also set `ansible_network_os` (e.g. `cisco.ios.ios`) so the plugin knows which CLI dialect — prompts, paging, error patterns — to expect from the device.",
            files: ['inventory.ini'],
            sample: [
              {
                file: 'inventory.ini',
                content: '[routers]\nrouter1 ansible_host=10.0.0.1\n\n[routers:vars]\nansible_connection=network_cli\nansible_network_os=cisco.ios.ios\nansible_user=admin\nansible_password=secret',
              },
            ],
          },
          {
            id: '6.3',
            q: 'What Ansible collection provides the `ios_*` modules for Cisco IOS devices, and how do you install it?',
            a: "The **`cisco.ios`** collection (part of the broader `cisco.ios`/`ansible.netcommon` ecosystem published on Ansible Galaxy). It ships modules like `cisco.ios.ios_config`, `cisco.ios.ios_facts`, and `cisco.ios.ios_command`, plus the `network_cli`/`ansible.netcommon` plugins many of them depend on.\n\nInstall it with `ansible-galaxy collection install cisco.ios` — it pulls in `ansible.netcommon` as a dependency automatically. Since Ansible 2.10+, network modules are no longer bundled with `ansible-core`, so this install step is required even on a fresh Ansible install.",
            sample: [
              {
                file: 'command',
                content: '$ ansible-galaxy collection install cisco.ios',
              },
            ],
            out: 'Starting galaxy collection install process\nProcess install dependency map\nStarting collection install process\nInstalling \'cisco.ios:5.3.0\' to \'/home/deploy/.ansible/collections/ansible_collections/cisco/ios\'\nInstalling \'ansible.netcommon:5.2.0\' to \'/home/deploy/.ansible/collections/ansible_collections/ansible/netcommon\'',
          },
        ],
      },
      {
        level: 'Intermediate',
        questions: [
          {
            id: '6.4',
            q: 'Write an inventory entry (INI format) for a host named `router1` that sets `ansible_connection=network_cli`, `ansible_network_os=cisco.ios.ios`, `ansible_user`, and `ansible_password` (or a vaulted equivalent).',
            a: "All four are **behavioral inventory variables** Ansible reads before it ever tries to connect — `ansible_connection` picks the plugin, `ansible_network_os` picks the CLI dialect, and `ansible_user`/`ansible_password` authenticate the SSH session itself (separate from any enable-mode password). In real projects the password line is replaced with an `ansible-vault`-encrypted variable rather than plaintext.",
            files: ['inventory.ini'],
            sample: [
              {
                file: 'inventory.ini',
                content: '[routers]\nrouter1 ansible_host=10.0.0.1 ansible_connection=network_cli ansible_network_os=cisco.ios.ios ansible_user=admin ansible_password="{{ vault_router1_password }}"',
              },
            ],
          },
          {
            id: '6.5',
            q: 'What is the purpose of `ansible_become` and `ansible_become_method: enable` when connecting to Cisco IOS devices, and when is it required?',
            a: "On Cisco IOS, the account you SSH in as often lands in **user EXEC mode** (`router1>`), which is read-only — configuration and even some `show` commands require **privileged EXEC mode** (`router1#`), entered via the `enable` command and (usually) a separate enable password. `ansible_become: true` combined with `ansible_become_method: enable` tells the `network_cli` plugin to automatically send `enable` and the enable password (`ansible_become_password`) right after login, before running any task commands.\n\nIt's required whenever the login user doesn't already land in (or auto-elevate to) privileged mode — which is the common case on production IOS devices — and is mandatory for any `ios_config` task, since configuration mode is only reachable from privileged EXEC.",
            files: ['inventory.ini'],
            sample: [
              {
                file: 'inventory.ini',
                content: '[routers:vars]\nansible_connection=network_cli\nansible_network_os=cisco.ios.ios\nansible_become=yes\nansible_become_method=enable\nansible_become_password="{{ vault_router1_enable_password }}"',
              },
            ],
          },
          {
            id: '6.6',
            q: 'Explain the difference between `network_cli` and `netconf` as connection types. Which Cisco platforms typically support each?',
            a: "**`network_cli`** drives the device's text CLI over SSH — it sends the same commands a human would type and scrapes/parses the text response. It works against essentially any Cisco CLI (IOS, IOS-XE, NX-OS, ASA) because it doesn't depend on the device exposing anything beyond an interactive terminal.\n\n**`netconf`** speaks the **NETCONF protocol** (RFC 6241) directly — XML-encoded RPCs over an SSH subsystem, with structured `<get-config>`/`<edit-config>` operations instead of scraped text — which is more precise and less brittle than parsing CLI output, but only works against platforms that actually **expose a NETCONF/YANG interface**, chiefly **IOS-XE** (with `netconf-yang` enabled) and some NX-OS releases; classic IOS generally does not support it. Practically: `network_cli` is the universal fallback, `netconf` is the more structured option where the platform supports it (and is what many of the newer Cisco resource modules prefer when available).",
          },
        ],
      },
      {
        level: 'Advanced',
        questions: [
          {
            id: '6.7',
            q: 'You have 200 routers across three regions with different enable passwords per region. Design a `group_vars` structure that keeps credentials organized and avoids duplicating variables per host.',
            a: "Model the regions as **inventory groups**, and let each region's `group_vars/<region>.yml` carry only what differs between regions — the enable password (ideally vaulted) — while a shared `group_vars/routers.yml` (or `group_vars/all.yml`) carries the connection settings common to every device. Ansible merges these automatically based on group membership, so no per-host duplication is needed at all; adding router #201 to a region is just one inventory line.",
            files: ['inventory.ini', 'group_vars/routers.yml', 'group_vars/region_east.yml', 'group_vars/region_west.yml', 'group_vars/region_central.yml'],
            sample: [
              {
                file: 'inventory.ini',
                content: '[region_east]\nrouter-e01 ansible_host=10.1.0.1\nrouter-e02 ansible_host=10.1.0.2\n\n[region_west]\nrouter-w01 ansible_host=10.2.0.1\n\n[region_central]\nrouter-c01 ansible_host=10.3.0.1\n\n[routers:children]\nregion_east\nregion_west\nregion_central',
              },
              {
                file: 'group_vars/routers.yml (shared by every region)',
                content: 'ansible_connection: network_cli\nansible_network_os: cisco.ios.ios\nansible_become: yes\nansible_become_method: enable\nansible_user: "{{ vault_router_user }}"\nansible_password: "{{ vault_router_password }}"',
              },
              {
                file: 'group_vars/region_east.yml',
                content: 'ansible_become_password: "{{ vault_enable_password_east }}"',
              },
              {
                file: 'group_vars/region_west.yml',
                content: 'ansible_become_password: "{{ vault_enable_password_west }}"',
              },
            ],
          },
          {
            id: '6.8',
            q: 'What role does `ansible_httpapi_*` play when working with platforms that expose a REST/HTTP API (e.g., some NX-OS or IOS-XE setups), versus using `network_cli`?',
            a: "The `httpapi` connection type talks to a device's **REST/HTTP management API** (e.g. NX-API on NX-OS, or RESTCONF on IOS-XE) instead of an interactive CLI session — requests and responses are structured JSON/XML over HTTP(S) rather than scraped terminal text. `ansible_httpapi_*` variables configure that transport specifically: `ansible_httpapi_use_ssl`, `ansible_httpapi_validate_certs`, and platform-specific ones like `ansible_httpapi_port`.\n\nCompared to `network_cli`, `httpapi` avoids CLI-scraping fragility (prompt detection, pagination, terminal-length quirks) and can be noticeably faster for bulk operations since it's a direct API call rather than an emulated terminal round-trip — but it only works where the device's HTTP API is enabled and licensed, whereas `network_cli` works anywhere SSH-to-CLI does. Many shops default to `network_cli` for universal compatibility and only reach for `httpapi` where the API is already enabled and performance/structure matters.",
            sample: [
              {
                file: 'inventory.ini (NX-API example)',
                content: '[switches:vars]\nansible_connection=httpapi\nansible_network_os=cisco.nxos.nxos\nansible_httpapi_use_ssl=yes\nansible_httpapi_validate_certs=no\nansible_user=admin\nansible_password="{{ vault_switch_password }}"',
              },
            ],
          },
          {
            id: '6.9',
            q: 'How would you securely store and reference Cisco device credentials using `ansible-vault`, and what changes in the inventory/group_vars to reference the vaulted values?',
            a: "Put the sensitive values (SSH password, enable password) in a **separate vars file that is entirely encrypted** with `ansible-vault`, rather than sprinkling `!vault` blocks inline — this keeps diffs clean and makes it obvious which file requires the vault password. The inventory/`group_vars` files then only reference those variable **names**, never the plaintext values, so they can be committed to version control safely.",
            files: ['group_vars/routers.yml', 'group_vars/routers_vault.yml'],
            sample: [
              {
                file: 'command',
                content: '$ ansible-vault create group_vars/routers_vault.yml',
              },
              {
                file: 'group_vars/routers_vault.yml (plaintext before encryption, then vault-encrypted on disk)',
                content: 'vault_router_user: admin\nvault_router_password: Sup3rSecret!\nvault_router_enable_password: EvenMoreSecret!',
              },
              {
                file: 'group_vars/routers.yml (safe to commit, references vault vars)',
                content: 'ansible_connection: network_cli\nansible_network_os: cisco.ios.ios\nansible_become: yes\nansible_become_method: enable\nansible_user: "{{ vault_router_user }}"\nansible_password: "{{ vault_router_password }}"\nansible_become_password: "{{ vault_router_enable_password }}"',
              },
              {
                file: 'command (running a playbook against vaulted vars)',
                content: '$ ansible-playbook site.yml -i inventory.ini --ask-vault-pass\n# or, for automation: --vault-password-file ~/.vault_pass.txt',
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 7,
    icon: 'fact_check',
    title: 'Gathering Facts & Running Read-Only Commands',
    blurb: '`ios_facts` and `ios_command`: inspecting device state safely before making any changes.',
    levels: [
      {
        level: 'Beginner',
        questions: [
          {
            id: '7.1',
            q: 'What module would you use to run `show version` on a Cisco IOS device and capture the output?',
            a: "**`cisco.ios.ios_command`**. It's built specifically to run one or more non-configuration `show`-style commands and return their raw text output (and optionally validate it against expected strings/patterns). It deliberately refuses configuration-mode commands — that's `ios_config`'s job — so it's safe to run without risk of accidentally changing device state.",
            files: ['show_version.yml'],
            sample: [
              {
                file: 'show_version.yml',
                content: '---\n- name: Run show version on a router\n  hosts: routers\n  gather_facts: no\n  tasks:\n    - name: Show version\n      cisco.ios.ios_command:\n        commands:\n          - show version\n      register: version_output\n\n    - debug:\n        var: version_output.stdout_lines',
              },
            ],
            out: 'TASK [Show version] ************************************************\nok: [router1]\n\nTASK [debug] ********************************************************\nok: [router1] => {\n    "version_output.stdout_lines": [\n        ["Cisco IOS Software, C2900 Software ...", "ROM: System Bootstrap ...", "router1 uptime is 3 weeks, 2 days ..."]\n    ]\n}',
          },
          {
            id: '7.2',
            q: 'What does `cisco.ios.ios_facts` do, and what kind of information does it typically gather (interfaces, version, hardware)?',
            a: "It's the network-device equivalent of Ansible's generic `setup`/fact-gathering — it connects to the device and populates `ansible_facts` with structured information about it, without changing anything. By default it gathers a broad set including:\n\n- **Default facts**: hostname, IOS version, model/hardware, serial number, uptime.\n- **Interfaces**: names, descriptions, MTU, speed/duplex, IP addresses, admin/operational status.\n- **Config facts** (if requested): the running configuration itself.\n\nMany playbooks run `ios_facts` as a first step so later tasks can make decisions (e.g. templating) based on real, current device state rather than assumptions.",
            files: ['gather_ios_facts.yml'],
            sample: [
              {
                file: 'gather_ios_facts.yml',
                content: '---\n- name: Gather facts from Cisco IOS devices\n  hosts: routers\n  gather_facts: no\n  tasks:\n    - name: Collect device facts\n      cisco.ios.ios_facts:\n\n    - debug:\n        msg: "{{ inventory_hostname }} is running {{ ansible_net_version }} on a {{ ansible_net_model }}"',
              },
            ],
            out: 'TASK [debug] ********************************************************\nok: [router1] => {\n    "msg": "router1 is running 16.9.4 on a CSR1000V"\n}',
          },
        ],
      },
      {
        level: 'Intermediate',
        questions: [
          {
            id: '7.3',
            q: 'Write a task using `cisco.ios.ios_command` that runs `show ip interface brief` and registers the output for later use.',
            a: "`register` captures the full result — including `stdout` (one string per command) and `stdout_lines` (pre-split into lines, usually more convenient) — into a named variable other tasks in the same play can reference.",
            files: ['int_brief.yml'],
            sample: [
              {
                file: 'int_brief.yml',
                content: '---\n- name: Check interface status\n  hosts: routers\n  gather_facts: no\n  tasks:\n    - name: Show ip interface brief\n      cisco.ios.ios_command:\n        commands:\n          - show ip interface brief\n      register: int_brief',
              },
            ],
            out: 'TASK [Show ip interface brief] *************************************\nok: [router1]\n\n# int_brief.stdout_lines[0] now holds:\n["Interface  IP-Address  OK? Method Status  Protocol",\n "GigabitEthernet0/0  10.0.0.1  YES manual up  up",\n "GigabitEthernet0/1  unassigned  YES unset  administratively down  down"]',
          },
          {
            id: '7.4',
            q: 'How do you restrict `ios_facts` to gather only a subset of facts (e.g., just interfaces) instead of everything, and why would you want to?',
            a: "Use the `gather_subset` parameter, listing only the categories you need — commonly `interfaces`, `config`, `hardware`, or `default`. Restricting it matters for two practical reasons:\n\n1. **Speed** — gathering the running config (`config`) on every host in a 500-device play adds real time and load to every single run; skipping subsets you don't use keeps large playbooks fast.\n2. **Clarity/safety** — a smaller, explicit `gather_subset` documents exactly what data the playbook actually depends on, rather than silently relying on \"whatever `ios_facts` happens to return by default.\"",
            files: ['facts_subset.yml'],
            sample: [
              {
                file: 'facts_subset.yml',
                content: '---\n- name: Gather only interface facts\n  hosts: routers\n  gather_facts: no\n  tasks:\n    - name: Collect interface facts only\n      cisco.ios.ios_facts:\n        gather_subset:\n          - interfaces',
              },
            ],
          },
          {
            id: '7.5',
            q: 'Explain the difference between `ios_command` (used for `show` commands) and `ios_config` (used for configuration changes). Why does Ansible separate these?',
            a: "**`ios_command`** only accepts and runs **non-configuration EXEC-mode commands** (`show ...`, `ping`, `traceroute`) — it never enters configuration mode and cannot alter device state; some versions even reject commands it detects as configuration-mode syntax. **`ios_config`** is the opposite: it's specifically for pushing `configure terminal`-mode lines, and it brings idempotency logic (comparing desired lines against the running config) that read-only commands have no use for.\n\nAnsible keeps these as separate modules so that **intent is explicit and auditable** at the task level — a reviewer (or a diff) can tell at a glance whether a given task is read-only or state-changing without having to parse the actual command strings inside it, and tooling/policy (e.g. \"no `ios_config` tasks allowed without an approval step\") can key off the module name alone.",
          },
        ],
      },
      {
        level: 'Advanced',
        questions: [
          {
            id: '7.6',
            q: 'Write a playbook task that runs `show ip interface brief`, parses the registered output, and fails the play if any interface is administratively down. What Ansible constructs (`register`, `when`, `failed_when`, filters) would you combine?',
            a: "Register the command output, then use `failed_when` on that same task (or a follow-up `assert`) with a Jinja test that scans `stdout_lines` for the `administratively down` marker. `select`/`selectattr`-style string filtering (`| select('search', ...)`) keeps the check declarative rather than hand-rolling a loop.",
            files: ['check_admin_down.yml'],
            sample: [
              {
                file: 'check_admin_down.yml',
                content: '---\n- name: Fail if any interface is administratively down\n  hosts: routers\n  gather_facts: no\n  tasks:\n    - name: Show ip interface brief\n      cisco.ios.ios_command:\n        commands:\n          - show ip interface brief\n      register: int_brief\n      failed_when: "\'administratively down\' in int_brief.stdout[0]"\n\n    - name: Report which interfaces are down (only reached if not failed above)\n      debug:\n        msg: "{{ int_brief.stdout_lines[0] | select(\'search\', \'down\') | list }}"',
              },
            ],
            out: "TASK [Show ip interface brief] *************************************\nfatal: [router1]: FAILED! => {\"changed\": false, \"msg\": \"Task failed as a result of failed_when condition\"}\n\nPLAY RECAP **********************************************************\nrouter1 : ok=1  changed=0  unreachable=0  failed=1  skipped=0",
          },
          {
            id: '7.7',
            q: 'How can `ios_facts` output be used later in the same playbook to conditionally template a configuration (e.g., only configure OSPF on devices with more than 2 interfaces)?',
            a: "Because `ios_facts` populates `ansible_facts`/`ansible_net_interfaces` before any later task runs, subsequent tasks can put a `when` condition (or a Jinja `{% if %}` inside a template) directly against that gathered data — no separate `register` needed, since facts are automatically available as variables for the rest of the play. The count of the `ansible_net_interfaces` dict is a plain Jinja `| length` check.",
            files: ['conditional_ospf.yml'],
            sample: [
              {
                file: 'conditional_ospf.yml',
                content: '---\n- name: Configure OSPF only on devices with more than 2 interfaces\n  hosts: routers\n  gather_facts: no\n  tasks:\n    - name: Gather device facts\n      cisco.ios.ios_facts:\n        gather_subset:\n          - interfaces\n\n    - name: Configure OSPF process\n      cisco.ios.ios_config:\n        lines:\n          - router ospf 1\n          - network 10.0.0.0 0.0.0.255 area 0\n      when: ansible_net_interfaces | length > 2',
              },
            ],
            out: '# on a router with 4 interfaces:\nTASK [Configure OSPF process] **************************************\nchanged: [router1]\n\n# on a router with only 2 interfaces:\nTASK [Configure OSPF process] **************************************\nskipping: [router2]',
          },
        ],
      },
    ],
  },
  {
    id: 8,
    icon: 'settings_ethernet',
    title: 'Writing Cisco Configuration Playbooks',
    blurb: '`ios_config` from inline lines to Jinja2 templates: parents, save_when, and diff-and-approve workflows.',
    levels: [
      {
        level: 'Beginner',
        questions: [
          {
            id: '8.1',
            q: 'Write a playbook task using `cisco.ios.ios_config` to set the hostname of a device to `edge-router-01`.',
            a: "`lines` takes a list of literal IOS configuration-mode commands, applied in order exactly as if typed under `configure terminal`. `hostname` is a top-level global-config command, so no `parents` are needed here.",
            files: ['set_hostname.yml'],
            sample: [
              {
                file: 'set_hostname.yml',
                content: '---\n- name: Set device hostname\n  hosts: router1\n  gather_facts: no\n  tasks:\n    - name: Configure hostname\n      cisco.ios.ios_config:\n        lines:\n          - hostname edge-router-01',
              },
            ],
            out: 'TASK [Configure hostname] ******************************************\nchanged: [router1]\n\n# on the device:\nedge-router-01#',
          },
          {
            id: '8.2',
            q: 'What does the `lines` parameter do in `ios_config`, and how is it different from `src`?',
            a: "`lines` is a list of **literal configuration commands** written directly in the playbook/task — good for a handful of straightforward, static lines. `src` instead points at an **external file** (often a rendered Jinja2 template) containing a full configuration block to push, which scales far better once configs get long, repetitive, or need to vary per host — you template once and let variables drive the differences, rather than hardcoding every line inline.",
          },
        ],
      },
      {
        level: 'Intermediate',
        questions: [
          {
            id: '8.3',
            q: 'Write a task that configures an interface description on `GigabitEthernet0/1` using `ios_config` with the `parents` parameter to enter interface configuration mode.',
            a: "`parents` tells `ios_config` which configuration-mode context the `lines` belong under — here, `interface GigabitEthernet0/1` — so the module knows to enter that sub-context (as if you'd typed `interface GigabitEthernet0/1` before `description ...` at the CLI) and to check idempotency against that specific block rather than the whole running-config.",
            files: ['int_description.yml'],
            sample: [
              {
                file: 'int_description.yml',
                content: '---\n- name: Set interface description\n  hosts: router1\n  gather_facts: no\n  tasks:\n    - name: Describe uplink interface\n      cisco.ios.ios_config:\n        lines:\n          - description Uplink to Core Switch\n        parents: interface GigabitEthernet0/1',
              },
            ],
            out: 'TASK [Describe uplink interface] ***********************************\nchanged: [router1]\n\n# running-config now shows:\ninterface GigabitEthernet0/1\n description Uplink to Core Switch',
          },
          {
            id: '8.4',
            q: 'What is the purpose of `src` in `ios_config` pointing to a Jinja2 template file, and how does this differ from inline `lines`?',
            a: "With `src`, you write a `.j2` template containing the intended configuration block (often with loops/conditionals over variables like a list of VLANs or interfaces), and `ios_config` renders it through Jinja2 **before** comparing it against the running config and pushing only what's missing. This scales far better than `lines` because one template can generate dozens of lines correctly and consistently per host from `host_vars`, instead of hand-writing (and hand-maintaining) every literal line for every device.",
            files: ['ntp.j2', 'configure_ntp.yml'],
            sample: [
              {
                file: 'ntp.j2',
                content: 'ntp server {{ item }}\n',
              },
              {
                file: 'configure_ntp.yml',
                content: '---\n- name: Push NTP config from a template\n  hosts: router1\n  gather_facts: no\n  tasks:\n    - name: Configure NTP servers\n      cisco.ios.ios_config:\n        src: ntp.j2',
              },
            ],
          },
          {
            id: '8.5',
            q: 'Write a playbook that configures NTP servers on a set of Cisco routers using a variable list (`ntp_servers`) looped with `loop`.',
            a: "Looping over `ntp_servers` and building one `ntp server <ip>` line per iteration keeps the source list (in `group_vars`) as the single place to add/remove an NTP server, without touching the playbook itself.",
            files: ['ntp_playbook.yml', 'group_vars/routers.yml'],
            sample: [
              {
                file: 'group_vars/routers.yml',
                content: 'ntp_servers:\n  - 10.10.10.1\n  - 10.10.10.2',
              },
              {
                file: 'ntp_playbook.yml',
                content: '---\n- name: Configure NTP servers\n  hosts: routers\n  gather_facts: no\n  tasks:\n    - name: Add NTP server\n      cisco.ios.ios_config:\n        lines:\n          - "ntp server {{ item }}"\n      loop: "{{ ntp_servers }}"',
              },
            ],
            out: 'TASK [Add NTP server] **********************************************\nchanged: [router1] => (item=10.10.10.1)\nchanged: [router1] => (item=10.10.10.2)',
          },
          {
            id: '8.6',
            q: "What does `ios_config`'s `save_when` parameter control, and what are the tradeoffs between `always`, `never`, `modified`, and `changed`?",
            a: "`save_when` controls whether `ios_config` runs the equivalent of `copy running-config startup-config` after applying changes — i.e., whether changes **survive a reload**.\n\n- **`always`** — saves on every single run, regardless of whether anything actually changed. Guarantees persistence but wastes a write cycle (and NVRAM writes are not free/instant) on runs that made no changes.\n- **`never`** — never saves automatically; changes are live but would be lost on reload unless saved manually/elsewhere. Safest for a \"review before persisting\" workflow, riskiest for \"set and forget.\"\n- **`modified`** — saves only if the **running config differs from the startup config** at the time of the check, regardless of whether this specific task made the diff. Catches drift from outside this playbook too, at the cost of occasionally saving changes unrelated to this run.\n- **`changed`** — saves only if **this task itself** reported a change. The common middle ground: persistence happens exactly when this run modified something, with no unnecessary saves and no risk of leaving today's change unsaved.",
          },
        ],
      },
      {
        level: 'Advanced',
        questions: [
          {
            id: '8.7',
            q: 'Write a Jinja2 template (`interfaces.j2`) and corresponding `ios_config` task that configures descriptions and IP addresses for a list of interfaces defined in `host_vars`, one block per interface.',
            a: "The template loops over a per-host `interfaces` list, emitting one `interface ... / description ... / ip address ...` block per entry, then `src:` renders it with that host's own `host_vars` and lets `ios_config` diff the whole rendered block against the running config in one pass.",
            files: ['host_vars/router1.yml', 'templates/interfaces.j2', 'configure_interfaces.yml'],
            sample: [
              {
                file: 'host_vars/router1.yml',
                content: 'interfaces:\n  - name: GigabitEthernet0/1\n    description: Uplink to Core\n    ip: 10.0.1.1\n    mask: 255.255.255.252\n  - name: GigabitEthernet0/2\n    description: LAN Segment A\n    ip: 10.0.2.1\n    mask: 255.255.255.0',
              },
              {
                file: 'templates/interfaces.j2',
                content: '{% for iface in interfaces %}\ninterface {{ iface.name }}\n description {{ iface.description }}\n ip address {{ iface.ip }} {{ iface.mask }}\n no shutdown\n{% endfor %}',
              },
              {
                file: 'configure_interfaces.yml',
                content: '---\n- name: Configure interfaces from per-host template\n  hosts: routers\n  gather_facts: no\n  tasks:\n    - name: Render and push interface config\n      cisco.ios.ios_config:\n        src: templates/interfaces.j2',
              },
            ],
            out: 'TASK [Render and push interface config] ****************************\nchanged: [router1]',
          },
          {
            id: '8.8',
            q: 'Explain how `ios_config` determines whether a configuration line is "already present" (idempotency) versus something that needs to be pushed. What happens if indentation/parent context is wrong in `parents`?',
            a: "`ios_config` fetches the current running-config, then compares your `lines` (and their `parents` context, if any) against it **structurally** — it looks for the exact line existing under the exact parent block, not just anywhere in the file. If the line already exists in that context, it's a no-op (`changed: false`); if it's missing or the surrounding context differs, it's pushed.\n\nIf `parents` names the **wrong context** (a typo, wrong interface name, or a context that doesn't match how the device actually nests it), `ios_config` won't find your `lines` under the context it expects — so it will conclude the line is \"missing\" and push it **as a new block under that (possibly wrong) parent**, potentially creating a stray or duplicate configuration section instead of modifying the one you intended, and every subsequent run may show `changed: true` again because it keeps failing to match. This is why getting `parents` exactly right (matching Cisco's own config hierarchy output verbatim) matters for idempotency, not just for correctness on the first run.",
          },
          {
            id: '8.9',
            q: "Design a playbook that performs a \"config diff and approve\" workflow: it generates the intended config, compares against running-config using `ios_config`'s `diff_against`, and only applies changes after a `pause`/approval step.",
            a: "Run `ios_config` first in **check mode** (`--check --diff`) so it computes and shows the diff (`diff_against: running`) without pushing anything, then use `pause` to require a human to confirm before a second, real (non-check) run actually applies it. This gives an explicit human gate between \"here's what would change\" and \"now make it happen.\"",
            files: ['diff_and_approve.yml'],
            sample: [
              {
                file: 'diff_and_approve.yml',
                content: '---\n- name: Diff intended config against running-config, then approve\n  hosts: router1\n  gather_facts: no\n  tasks:\n    - name: Show intended vs running diff (dry run only)\n      cisco.ios.ios_config:\n        src: templates/interfaces.j2\n        diff_against: running\n      check_mode: yes\n      register: config_diff\n\n    - name: Display the diff for review\n      debug:\n        var: config_diff.diff\n\n    - name: Pause for manual approval\n      pause:\n        prompt: "Review the diff above. Press Enter to apply, or Ctrl+C then A to abort"\n\n    - name: Apply the approved configuration\n      cisco.ios.ios_config:\n        src: templates/interfaces.j2\n        diff_against: running',
              },
              {
                file: 'command',
                content: '$ ansible-playbook diff_and_approve.yml -i inventory.ini',
              },
            ],
            out: "TASK [Display the diff for review] *********************************\nok: [router1] => {\n    \"config_diff.diff\": [{\n        \"before\": \"interface GigabitEthernet0/2\\n description old\\n\",\n        \"after\": \"interface GigabitEthernet0/2\\n description LAN Segment A\\n\"\n    }]\n}\n\nTASK [Pause for manual approval] ************************************\n[Pause for manual approval]\nReview the diff above. Press Enter to apply, or Ctrl+C then A to abort:",
          },
          {
            id: '8.10',
            q: "How would you roll back a configuration change on a Cisco device if a task fails partway through, using `ios_config`'s backup and rollback-related options?",
            a: "Set `backup: yes` on the `ios_config` task so Ansible saves a timestamped copy of the running-config **before** making any changes (stored locally under `backup/` by default). If a subsequent task in the run fails, a follow-up task can push that saved backup file back with `ios_config`'s `src:` (pointing at the backup file) to restore the prior state, typically wrapped in a `block`/`rescue` so the rollback only fires on failure.",
            files: ['backup_and_rollback.yml'],
            sample: [
              {
                file: 'backup_and_rollback.yml',
                content: '---\n- name: Change config with automatic rollback on failure\n  hosts: router1\n  gather_facts: no\n  tasks:\n    - name: Backup, change, and roll back on failure\n      block:\n        - name: Backup running-config before changing anything\n          cisco.ios.ios_config:\n            backup: yes\n          register: backup_result\n\n        - name: Apply risky configuration change\n          cisco.ios.ios_config:\n            lines:\n              - no ip routing\n\n        - name: Verify device is still reachable\n          cisco.ios.ios_command:\n            commands:\n              - show ip interface brief\n\n      rescue:\n        - name: Roll back to the pre-change backup\n          cisco.ios.ios_config:\n            src: "{{ backup_result.backup_path }}"',
              },
            ],
            out: 'TASK [Backup running-config before changing anything] **************\nok: [router1]\n\nTASK [Apply risky configuration change] *****************************\nchanged: [router1]\n\nTASK [Verify device is still reachable] *****************************\nfatal: [router1]: FAILED! => {"msg": "connection timeout"}\n...ignoring, entering rescue\n\nTASK [Roll back to the pre-change backup] ***************************\nchanged: [router1]',
          },
        ],
      },
    ],
  },
  {
    id: 9,
    icon: 'verified',
    title: 'Backups, Compliance & Idempotency',
    blurb: 'Timestamped config backups, golden-config compliance checks, and safe staged rollout at scale.',
    levels: [
      {
        level: 'Beginner',
        questions: [
          {
            id: '9.1',
            q: 'What does setting `backup: yes` on an `ios_config` task do, and where are the backup files stored by default?',
            a: "It makes `ios_config` save a copy of the device's running-config **before** applying any changes in that task, so you always have a pre-change snapshot to compare against or restore from. By default, backups are written to a **`backup/` directory relative to the playbook**, with a filename incorporating the inventory hostname and a timestamp (e.g. `backup/router1_config.2026-07-04@10:32:15.cfg`) — the exact path returned in the task result as `backup_path`.",
            sample: [
              {
                file: 'backup_task.yml',
                content: '- name: Back up running config\n  cisco.ios.ios_config:\n    backup: yes',
              },
            ],
            out: 'TASK [Back up running config] **************************************\nok: [router1] => {\n    "backup_path": "backup/router1_config.2026-07-04@10:32:15.cfg"\n}',
          },
        ],
      },
      {
        level: 'Intermediate',
        questions: [
          {
            id: '9.2',
            q: 'Write a playbook that backs up the running configuration of all routers in the `routers` group before making any changes, and stores each backup with the hostname and timestamp in the filename.',
            a: "`ios_config`'s built-in `backup: yes` already timestamps and names files per host automatically, so an explicit filename usually isn't needed — but you can pin the exact path/filename yourself via `backup_options` when you need a specific naming convention (e.g. to match an existing backup archive's layout).",
            files: ['backup_all.yml'],
            sample: [
              {
                file: 'backup_all.yml',
                content: '---\n- name: Backup all router configs before any changes\n  hosts: routers\n  gather_facts: no\n  tasks:\n    - name: Save timestamped running-config backup\n      cisco.ios.ios_config:\n        backup: yes\n        backup_options:\n          filename: "{{ inventory_hostname }}_{{ ansible_date_time.iso8601_basic_short }}.cfg"\n          dir_path: ./backups',
              },
            ],
            out: 'TASK [Save timestamped running-config backup] **********************\nok: [router1] => {"backup_path": "./backups/router1_20260704T103215.cfg"}\nok: [router2] => {"backup_path": "./backups/router2_20260704T103216.cfg"}',
          },
          {
            id: '9.3',
            q: "Why is idempotency especially important for network configuration playbooks compared to, say, installing a package — what could go wrong if a task pushes the same `ntp server` line every run?",
            a: "For most software config, re-applying an already-correct setting is harmless (writing the same file content twice is a no-op). Network device CLIs are **stateful and additive by design** — many `ntp server`/`access-list`/`route`-style commands don't overwrite an existing entry, they **append another one**. A non-idempotent task re-run isn't a wasted no-op; it can leave the device with **duplicate NTP servers, duplicate ACL entries, or duplicate static routes**, subtly changing behavior (e.g. skewing which NTP source is preferred, or bloating an ACL) without any obvious error — and because `command`/`shell`-style modules always report `changed: true`, nothing in the output even flags that something unusual just happened.\n\nThis is exactly why `ios_config` compares against the running-config before pushing anything: it only sends `ntp server 10.10.10.1` if that exact line isn't already present, so re-running the playbook a hundred times converges on the same state instead of accumulating duplicates.",
          },
        ],
      },
      {
        level: 'Advanced',
        questions: [
          {
            id: '9.4',
            q: 'Design a compliance-check playbook: it gathers `ios_facts`, compares the running config against a "golden config" template, and reports (without applying) which devices are out of compliance. What modules/approach would you use?',
            a: "Render the golden-config template locally (or via `ios_config` in check mode with `diff_against: running`) so nothing is ever pushed, then use the returned diff to classify each host as compliant/non-compliant and aggregate the results into a single readable report at the end of the run — `ios_config` with `check_mode: yes` gives exactly the \"would this change anything\" signal needed, without touching the device.",
            files: ['compliance_check.yml', 'templates/golden_config.j2'],
            sample: [
              {
                file: 'compliance_check.yml',
                content: '---\n- name: Check device compliance against golden config\n  hosts: routers\n  gather_facts: no\n  tasks:\n    - name: Gather device facts\n      cisco.ios.ios_facts:\n\n    - name: Compare running-config against golden template (never applies)\n      cisco.ios.ios_config:\n        src: templates/golden_config.j2\n        diff_against: running\n      check_mode: yes\n      register: compliance\n\n    - name: Record compliance status\n      set_fact:\n        compliance_status: "{{ \'COMPLIANT\' if not compliance.changed else \'OUT OF COMPLIANCE\' }}"\n\n    - name: Report compliance across all devices\n      debug:\n        msg: "{{ inventory_hostname }}: {{ compliance_status }}"\n      run_once: false',
              },
            ],
            out: 'TASK [Report compliance across all devices] ************************\nok: [router1] => {"msg": "router1: COMPLIANT"}\nok: [router2] => {"msg": "router2: OUT OF COMPLIANCE"}',
          },
          {
            id: '9.5',
            q: 'How would you structure a playbook to safely apply configuration changes across 500 devices in batches, limiting concurrent connections and stopping if a threshold of failures is reached (`serial`, `max_fail_percentage`)?',
            a: "`serial` breaks the play into successive batches (e.g. `serial: 25` — or a progressive list like `serial: [5, 25, 100]` to start cautious and widen once confidence is established), so at most that many devices are touched **concurrently** before moving to the next batch. `max_fail_percentage` sets a failure threshold **within each batch** — if enough hosts in the current batch fail, Ansible **aborts the entire play** before starting the next batch, rather than ploughing on and potentially misconfiguring hundreds more devices under whatever went wrong with the first ones.",
            files: ['staged_rollout.yml'],
            sample: [
              {
                file: 'staged_rollout.yml',
                content: '---\n- name: Staged rollout across 500 routers\n  hosts: routers\n  gather_facts: no\n  serial:\n    - 5\n    - 25\n    - 100\n  max_fail_percentage: 10\n  tasks:\n    - name: Backup before changing\n      cisco.ios.ios_config:\n        backup: yes\n\n    - name: Apply the new configuration\n      cisco.ios.ios_config:\n        src: templates/golden_config.j2',
              },
            ],
            out: 'PLAY [Staged rollout across 500 routers] ****************************\n\nPLAY RECAP (batch of 5) *********************************************\nrouter001-005 : ok=2  changed=2  unreachable=0  failed=0\n\n# batch of 25 begins only after batch of 5 succeeds within the failure threshold...\n\n# if a later batch exceeds 10% failures:\nFATAL: [router142]: FAILED! => ...\nNO MORE HOSTS LEFT (past max_fail_percentage for this play)',
          },
        ],
      },
    ],
  },
  {
    id: 10,
    icon: 'troubleshoot',
    title: 'Debugging Cisco Playbook & Connection Errors',
    blurb: 'Connection vs. device vs. Ansible-logic failures — and the verbosity/timeout knobs that isolate each.',
    levels: [
      {
        level: 'Beginner',
        questions: [
          {
            id: '10.1',
            q: "You run a playbook against a router and get `unable to open shell`. What are the first two things you'd check?",
            a: "1. **`ansible_network_os` / `ansible_connection` are actually set** for that host (directly or via group_vars) — `network_cli` silently can't establish the expected CLI session without knowing which OS dialect to expect, and a missing/misspelled value is the single most common cause of this exact error.\n2. **Basic SSH reachability and credentials** — can you `ssh <user>@<host>` manually from the control node right now? `unable to open shell` is `network_cli`'s generic wrapper around a failed session setup, which includes plain network unreachability, a wrong port, or bad credentials — not just a network_cli-specific problem.",
          },
          {
            id: '10.2',
            q: 'What does the error `Authentication failed` when connecting to a Cisco device usually indicate, beyond a wrong password?',
            a: "Beyond a simple typo'd password, this error commonly also shows up for: an **account locked out or disabled** on the device (e.g. after too many failed attempts), a **user that exists but lacks the required privilege level**, an **AAA/TACACS+ server being unreachable** if the device authenticates against one instead of a local user database (so the device itself can't validate any credentials, correct or not), or `ansible_user`/`ansible_password` simply being **undefined for that host** (falling back to an empty/wrong value inherited from another group). It's worth checking device-side AAA logs, not just re-typing the password.",
          },
        ],
      },
      {
        level: 'Intermediate',
        questions: [
          {
            id: '10.3',
            q: 'Debug this inventory snippet — identify the missing/incorrect variable that would prevent `network_cli` from working:\n```ini\n[routers]\nrouter1 ansible_host=10.0.0.1 ansible_user=admin ansible_password=secret\n```',
            a: "Two required behavioral variables are missing entirely: **`ansible_connection=network_cli`** and **`ansible_network_os=cisco.ios.ios`**. Without `ansible_connection`, Ansible defaults to the generic `ssh` plugin, which will try to detect/copy a Python interpreter to the device and fail outright since IOS has none. Even if `ansible_connection` were set, `network_cli` still needs `ansible_network_os` to know which CLI dialect (prompts, paging behavior, error-string patterns) to expect — omitting it produces connection-plugin errors rather than a clean login.",
            files: ['inventory.ini (broken)', 'inventory.ini (fixed)'],
            sample: [
              {
                file: 'inventory.ini (broken)',
                content: '[routers]\nrouter1 ansible_host=10.0.0.1 ansible_user=admin ansible_password=secret',
              },
              {
                file: 'inventory.ini (fixed)',
                content: '[routers]\nrouter1 ansible_host=10.0.0.1 ansible_user=admin ansible_password=secret ansible_connection=network_cli ansible_network_os=cisco.ios.ios',
              },
            ],
          },
          {
            id: '10.4',
            q: 'A task using `ios_config` reports `changed: true` on every single run even though the config appears identical. What are two likely causes (hint: trailing whitespace, `parents` mismatch, banner/multiline config)?',
            a: "1. **Whitespace/formatting mismatch** — trailing spaces, different quoting, or a subtly different rendering of the same logical line (e.g. extra blank lines from a template) makes the comparison against the running-config fail even though the line is functionally identical; `ios_config` compares fairly literally.\n2. **Wrong or missing `parents`** — as covered earlier, if `parents` doesn't exactly match how the device nests that block, `ios_config` never finds your `lines` under the context it's looking in, concludes they're missing, and re-pushes them every run.\n\nA close third worth mentioning: **multiline constructs like `banner motd`** don't diff cleanly line-by-line the way simple config statements do, and are a well-known source of perpetual `changed: true` unless handled with the module's banner-specific support rather than plain `lines`.",
          },
          {
            id: '10.5',
            q: "You see `Invalid input detected at '^' marker` in the task output. What does this tell you about where the error originated (Ansible vs. the device), and how would you find the exact bad command?",
            a: "This message is the Cisco IOS CLI's **own native syntax error** — it means the command actually reached the device and the device's own parser rejected it; Ansible itself found nothing wrong at parse time (this is not a YAML or module-argument problem). The `^` marks the exact character position in the command where IOS stopped understanding it.\n\nTo find the exact bad command: run with `-vvv`, which shows the literal command strings sent to the device one at a time — cross-reference the failing command against the `^` position reported, and often the fastest fix is just typing that exact string manually at the device's own CLI to reproduce and see the same error directly, confirming it's a device-side syntax issue (wrong keyword, wrong mode, unsupported command on this IOS version) rather than an Ansible logic bug.",
          },
        ],
      },
      {
        level: 'Advanced',
        questions: [
          {
            id: '10.6',
            q: "Explain the difference between a connection-level failure (timeout, `unable to open shell`, authentication) and a device-level command rejection (`% Invalid input`). How does the troubleshooting approach differ for each?",
            a: "A **connection-level failure** means Ansible never successfully established (or maintained) the CLI session at all — nothing was executed on the device; the problem is entirely in reachability, credentials, or the `network_cli`/plugin configuration. Troubleshooting stays on the **control node and network path**: SSH reachability, inventory connection variables, timeouts, firewall/ACLs between control node and device.\n\nA **device-level command rejection** means the connection worked fine — Ansible logged in successfully — but a specific command it sent was **rejected by the device's own CLI parser** (wrong syntax, wrong mode, unsupported on this platform/version). Troubleshooting moves to the **command content itself and the device's capabilities**: check the exact command against that IOS version's supported syntax, check `parents`/mode context, and consider testing the command manually on the device.\n\nThe practical tell: connection failures happen **before any `TASK [...]` line even completes** for that host (or show as `UNREACHABLE!`), while command rejections show up as a normal `FAILED!` with real device output attached, after the connection clearly succeeded.",
          },
          {
            id: '10.7',
            q: "A playbook works fine against IOS devices but fails against an IOS-XE device with a module/platform mismatch error. What's the likely misconfiguration in `ansible_network_os`, and how do collection namespaces (`cisco.ios` vs `cisco.ios.ios`... vs newer resource modules) factor in?",
            a: "The most common cause is `ansible_network_os` still pointing at a value meant for classic IOS (or a bare, unqualified name) when the device is actually IOS-XE — in modern collections, `ansible_network_os` must be the **fully-qualified collection name**, e.g. `cisco.ios.ios` (which is actually the correct value for both classic IOS *and* IOS-XE, since IOS-XE shares the same CLI dialect and is served by the same `cisco.ios` collection) rather than an old short-form name like `ios` left over from pre-collections Ansible, which the `network_cli` plugin can no longer resolve to an actual platform profile.\n\nThe **namespace** matters because collections are versioned and looked up by their full path: `cisco.ios` is the collection, `cisco.ios.ios_config` is a specific module inside it, and `ansible_network_os: cisco.ios.ios` tells the `network_cli`/`ansible.netcommon` plugins which **platform profile** (prompt patterns, terminal settings, cliconf plugin) to load — mismatching or truncating that string means Ansible can't find a matching cliconf plugin at all, producing exactly the module/platform mismatch seen here. It's also worth checking whether an IOS-XE-specific detail (e.g. RESTCONF/NETCONF-only resource modules) is being invoked where a plain `cisco.ios.ios_config` task was intended.",
          },
          {
            id: '10.8',
            q: "Using `ansible-playbook -vvv` against a network device, what specific additional information (compared to a Linux target) helps you diagnose `network_cli` connection issues — e.g., persistent connection socket errors, `ANSIBLE_PERSISTENT_CONNECT_TIMEOUT`?",
            a: "Against network devices, `-vvv` surfaces detail specific to the **persistent connection framework** that `network_cli` relies on (a background socket process reused across tasks, rather than a fresh SSH session per task like plain `ssh` often behaves conversationally): the exact commands sent and raw text received back from the CLI session, prompt-detection attempts, and — critically — **persistent connection socket errors** if the background connection process dies or times out mid-play, which show up as a distinct error class from a normal SSH failure.\n\nTwo timeout settings specifically become visible/relevant here that don't matter for a typical Linux `ssh` target: `ANSIBLE_PERSISTENT_CONNECT_TIMEOUT` (how long to wait for the *initial* persistent connection to establish) and `ANSIBLE_PERSISTENT_COMMAND_TIMEOUT` (how long to wait for a *response* to a given command once connected) — `-vvv` output will show exactly which of these was hit when a slow or unresponsive device causes a failure, which is not a distinction that exists at all for the default `ssh` connection plugin.",
          },
          {
            id: '10.9',
            q: "A large batch playbook run partially fails — 40 of 200 routers show `Data could not be sent to remote host ... Timeout`. Walk through how you'd distinguish an Ansible-side timeout setting issue from a genuine network/device-side problem, and what config (`ansible_command_timeout`, `persistent_connect_timeout`) you'd tune first.",
            a: "1. **Look for a pattern, not just a count.** Are the 40 failures clustered in one region/subnet/device model, or scattered randomly across the batch? Clustering points at a genuine network/device-side issue (a specific WAN link, a specific device model that's slow to respond); random scatter across otherwise-healthy devices points more toward an Ansible-side timeout that's simply too tight for normal, if occasionally slow, response variance under load.\n2. **Check if failures correlate with concurrency.** If failures happen mostly when many devices are hit at once (large `forks`, no `serial`), it's often the control node or intermediate network gear being overwhelmed rather than any individual device actually being broken — a symptom fixed by throttling concurrency (`serial`, lower `forks`), not by raising timeouts.\n3. **Re-run just the failed 40 in isolation** (`--limit @retry_file` or a fresh inventory of just those hosts) with a longer timeout and lower concurrency. If they now succeed reliably, that strongly suggests the original run was timeout/concurrency-bound, not a real device outage.\n4. **Tune `ansible_command_timeout`** (how long to wait for a command response once connected — the more common one to raise first, since slow `show`/`config` responses on a loaded device are the most frequent real-world cause) **before** `persistent_connect_timeout` (how long to wait for the initial connection setup) — a response timeout is by far the more common practical culprit in bulk network automation than the initial handshake timing out.",
            sample: [
              {
                file: 'group_vars/routers.yml (relevant timeout tuning)',
                content: 'ansible_command_timeout: 60\npersistent_connect_timeout: 30',
              },
            ],
          },
          {
            id: '10.10',
            q: "Debug this `ios_config` task and explain why it might silently fail to enter the expected configuration context:\n```yaml\n- name: Set interface description\n  cisco.ios.ios_config:\n    lines:\n      - description Uplink to Core\n    parents: interface GigabitEthernet0/1\n```",
            a: "This specific task is actually **syntactically fine** as a single-parent case — `parents` accepts a plain string when there's exactly one level of nesting, and `interface GigabitEthernet0/1` is a valid single parent context. The real risk here is more subtle: because `parents` is written as a **bare string**, this task silently breaks the moment someone later needs **nested parent context** (e.g. `router bgp 65000` → `address-family ipv4` → a neighbor statement, which needs two levels of parents) — at that point `parents` must become a **list** (`parents: [\"router bgp 65000\", \"address-family ipv4\"]`), and a bare string won't express that at all.\n\nThe more common real-world variant of this bug is a **typo or case-mismatch in the interface name** itself — e.g. `Gi0/1` instead of the device's actual `GigabitEthernet0/1`, or an extra space — which won't raise any error; `ios_config` just fails to match this context against the running-config, concludes the line is missing, and pushes it as a **new, likely malformed configuration block** rather than entering the interface you intended. Always match the interface name exactly as `show running-config` renders it (checked via `ios_facts` or `ios_command` beforehand) rather than assuming a shorthand form will resolve.",
          },
        ],
      },
    ],
  },
]

export const progression = [
  { stage: 1, focus: 'Get Ansible installed, understand config precedence and directory layout' },
  { stage: 2, focus: 'Practice ad-hoc commands and core YAML/module syntax' },
  { stage: 3, focus: 'Build static inventories, then explore dynamic inventory concepts' },
  { stage: 4, focus: 'Write playbooks: single task → multi-play → handlers/variables → roles/blocks' },
  { stage: 5, focus: 'Deliberately break playbooks and practice diagnosing each error category' },
  { stage: 6, focus: 'Understand why Cisco devices need network_cli/netconf; set up inventory and credentials' },
  { stage: 7, focus: 'Practice read-only fact gathering and show commands before touching config' },
  { stage: 8, focus: 'Write ios_config tasks: inline lines → templates → idempotent, parameterized configs' },
  { stage: 9, focus: 'Add safety: backups, compliance checks, staged rollout across many devices' },
  { stage: 10, focus: 'Deliberately break connections/configs and practice diagnosing connection vs. device vs. Ansible logic errors' },
]
