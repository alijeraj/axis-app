import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Page, AppHeader, PageBody } from '../components/Layout';

const API = 'https://axis-backend-production-5e9b.up.railway.app';

const PATTERN_COLORS = [
  '#E8B84A', '#E89048', '#E87878', '#D88AB0', '#A07AC4', '#7DA8E0',
  '#5DB8A6', '#7DB860', '#A88860', '#D8D8D8', '#5C5C5C', '#000000',
];

const newId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

const PRESETS = [
  {
    key: 'familyroles',
    name: 'Family Systems / Childhood Roles',
    blurb: 'Backbone: Wegscheider-Cruse · Golden Child from the narcissistic-family model (Pressman & Pressman) · Parentified Child from Minuchin (structural family therapy).',
    items: [
      {
        name: 'Hero', color: '#E8B84A',
        details: [
          { label: 'Origin / How the Role Forms', value: 'Usually the eldest/capable child; steps up to provide the family a source of pride and competence the dysfunction can\'t supply. Earned, not granted, elevation through achievement and over-responsibility.' },
          { label: 'Childhood Behavior', value: 'Over-achieves; takes on adult responsibilities early; self-disciplined, reliable, the \'good kid\' who makes the family look functional.' },
          { label: 'Function in the Family', value: 'Restores the family\'s self-image and worth; gives the system something to point to as proof it\'s okay.' },
          { label: 'Emotional Cost', value: 'Self-worth fused to performance; can\'t rest or fail; buries own needs under duty; chronic pressure and fear of inadequacy.' },
          { label: 'Adult Trajectory', value: 'Driven, controlling, can\'t delegate; workaholism and burnout; may slide into the Enabler role (the over-functioning rescuer) in adult relationships.' },
        ],
      },
      {
        name: 'Golden Child', color: '#E89048',
        details: [
          { label: 'Origin / How the Role Forms', value: 'Anointed by a parent (often a narcissistic one) as a chosen extension of themselves, regardless of achievement. Proximity and favor, not merit, install the role (can fall to a relative, not only a sibling).' },
          { label: 'Childhood Behavior', value: 'Favored and idealized; shielded from blame; mirrors the parent\'s image; rewarded for reflecting the parent, not for being a self.' },
          { label: 'Function in the Family', value: 'Serves the parent\'s ego as living proof of their specialness; the family\'s designated \'success\' through whom a parent feeds.' },
          { label: 'Emotional Cost', value: 'No authentic self allowed, only the projected one; conditional love tied to compliance; fragile identity beneath the privilege.' },
          { label: 'Adult Trajectory', value: 'May develop narcissistic traits (the anointed self becomes the only self), or collapse into emptiness/anxiety when the supply of approval ends; difficulty knowing who they actually are.' },
        ],
      },
      {
        name: 'Scapegoat', color: '#7DA8E0',
        details: [
          { label: 'Origin / How the Role Forms', value: 'Cast as the family\'s problem-carrier; absorbs blame meant for the truly dysfunctional member. Often the most perceptive/honest child, punished for seeing and naming the truth.' },
          { label: 'Childhood Behavior', value: 'Acts out, rebels, or is simply labeled \'the difficult one\'; frequently criticized and blamed; the family\'s designated troublemaker and truth-teller.' },
          { label: 'Function in the Family', value: 'Diverts attention from the real issue; gives the system somewhere to project its failures so it never has to look at itself.' },
          { label: 'Emotional Cost', value: 'Internalized worthlessness; isolation and feeling misunderstood; deep resentment; carries families deep emotional burdens.' },
          { label: 'Adult Trajectory', value: 'Struggles with authority; self-destructive patterns or, conversely, becomes the one who breaks the cycle and sees clearly; anger and resentment to resolve.' },
        ],
      },
      {
        name: 'Lost Child', color: '#9AA0A6',
        details: [
          { label: 'Origin / How the Role Forms', value: 'Survives a chaotic system by becoming invisible; withdraws to avoid adding to the family\'s burden or drawing fire.' },
          { label: 'Childhood Behavior', value: 'Quiet, solitary, undemanding; disappears into books/fantasy/solo activity; asks for nothing, causes no trouble, goes unnoticed.' },
          { label: 'Function in the Family', value: 'Provides relief,one less child to worry about; reduces the load by needing nothing.' },
          { label: 'Emotional Cost', value: 'Loneliness, invisibility, and a buried sense of inadequacy; needs and identity go unexpressed and underdeveloped.' },
          { label: 'Adult Trajectory', value: 'Avoidant, super-independent, hard to know; difficulty with intimacy and asserting needs; may struggle to feel they matter or take up space.' },
        ],
      },
      {
        name: 'Mascot', color: '#5DB8A6',
        details: [
          { label: 'Origin / How the Role Forms', value: 'Becomes the family\'s comic relief; uses humor and charm to break tension and survive the emotional climate.' },
          { label: 'Childhood Behavior', value: 'Funny, cute, hyperactive, performative; deflects conflict with jokes; often kept unaware of the family\'s real problems.' },
          { label: 'Function in the Family', value: 'Diffuses tension and lightens the atmosphere; gives the system relief from its anxiety.' },
          { label: 'Emotional Cost', value: 'Fear, insecurity, and loneliness hidden under the performance; rarely taken seriously; emotions go unfelt because the job is to entertain.' },
          { label: 'Adult Trajectory', value: 'Uses humor to avoid depth; difficulty being taken seriously or sitting with hard emotions; anxiety beneath the charm.' },
        ],
      },
      {
        name: 'Enabler', color: '#D88AB0',
        details: [
          { label: 'Origin / How the Role Forms', value: 'Typically the co-parent/spouse (an adult role) who manages the dysfunction by smoothing it over and protecting the dysfunctional member from consequences.' },
          { label: 'Childhood Behavior', value: '(Primarily an adult/co-parent role rather than a child role.) When a child carries it, they prematurely caretake and cover for a parent.' },
          { label: 'Function in the Family', value: 'Reduces tension and offers a surface sense of stability; holds the family together, while unintentionally sustaining the dysfunction.' },
          { label: 'Emotional Cost', value: 'Self-erasure; chronic over-responsibility for others\' behavior; own needs perpetually deferred; complicity guilt.' },
          { label: 'Adult Trajectory', value: 'Codependency; surrounds self with people who need rescuing; over-functions in relationships; smoothing conflict feels like survival.' },
        ],
      },
      {
        name: 'Parentified Child', color: '#A07AC4',
        details: [
          { label: 'Origin / How the Role Forms', value: 'A vacancy in the parental subsystem, a parent who leaves, dies, or is incapacitated, pulls a child upward into the missing adult\'s role. Instrumental (tasks) and/or emotional/spousal (surrogate partner); the emotional form usually carries the instrumental with it.' },
          { label: 'Childhood Behavior', value: 'Raises siblings, runs the household, and/or becomes a parent\'s confidant or emotional surrogate; performs an adult role before being developmentally ready for it.' },
          { label: 'Function in the Family', value: 'Fills the structural hole left by the missing/failing parent; keeps the family operational or emotionally regulated.' },
          { label: 'Emotional Cost', value: 'Lost childhood; the authentic self is sacrificed to the role; boundary collapse (especially in the spousal form); over-responsibility imprinted early.' },
          { label: 'Adult Trajectory', value: 'Over-functioning, can\'t-rest adult; caretakes partners; difficulty receiving; in extreme/spousal cases the sacrificed self can adapt into narcissistic structure.' },
        ],
      },
    ],
  },
  {
    key: 'clusterb',
    name: 'Personality Disorders (Cluster B)',
    blurb: 'Cluster B personality structures. Overt / Covert: Pincus & Lukowitsky (2010), Miller et al. (2011), Cain et al. (2008). Communal: Gebauer et al. (2012). Malignant: Kernberg (1984), Caligor, Levy & Yeomans (2015). Inverted: Vaknin, Malignant Self-Love: Narcissism Revisited; The Inverted (Covert) Narcissist Codependent.',
    items: [
      {
        name: 'Antisocial', color: '#9AA0A6',
        details: [
          { label: 'Trigger', value: 'Social standards and rules' },
          { label: 'Behavioral Style', value: 'Self-reliant, cunning, and forceful; risk-taking and thrill-seeking; glib and shallow' },
          { label: 'Interpersonal Style', value: 'Deceitful; irritable and aggressive; reckless disregard for others; lacks empathy; distrustful of others' },
          { label: 'Cognitive Style', value: 'Impulsive; externally oriented and realistic' },
          { label: 'Feeling Style', value: 'Avoids “softer” emotions which connote weakness; shows little guilt, remorse, or shame' },
          { label: 'Temperament', value: 'Ill-tempered infantile pattern and an aggressive, impulsive adult pattern' },
          { label: 'Self-View', value: '“I\'m cunning and I\'m entitled to get what I want”' },
          { label: 'World View', value: '“Life is devious and hostile and rules keep me from fulfilling my needs. Therefore, I\'ll bend or break them because my needs come first, and I\'ll defend any efforts to be controlled or degraded.”' },
          { label: 'Maladaptive Schemas', value: 'Mistrust/Abuse; Entitlement; Insufficient Self-Control; Defectiveness; Emotional Deprivation; Abandonment; Social Isolation' },
          { label: 'Optimal Diagnostic Criteria', value: 'Criminal, aggressive, impulsive, irresponsible behavior' },
        ],
      },
      {
        name: 'Borderline', color: '#E8B84A',
        details: [
          { label: 'Trigger', value: 'Expectation of meeting personal goals and/or maintaining close relationships' },
          { label: 'Behavioral Style', value: 'Impulsivity; acting-out behaviors; helpless, empty “void”; unstable, intense relationships; fear of abandonment' },
          { label: 'Interpersonal Style', value: 'Alternates between extremes of idealization and devaluation' },
          { label: 'Cognitive Style', value: 'Inflexible, rigid thinking; failure to learn from experience; external locus of control' },
          { label: 'Feeling Style', value: 'Emotionally reactive and dysregulated; extreme lability of mood and affect; intense anger' },
          { label: 'Temperament', value: 'Dependent type: passive infantile pattern—low autonomic reactivity; Histrionic type: hyperresponsive—high autonomic reactivity; Passive-Aggressive type: “difficult”—affect irritability' },
          { label: 'Self-View', value: '“I don\'t know who I am or where I\'m going” - identity problems; fluctuates with current emotion, loyalties, values; unstable self-esteem' },
          { label: 'World View', value: '“People are great, no they\'re not. Having goals is good, no it\'s not. If life doesn\'t go my way, I can\'t tolerate it. Don\'t commit to anything.”' },
          { label: 'Maladaptive Schemas', value: 'Abandonment; Defectiveness; Abuse/Mistrust; Insufficient Self-Control; Emotional Deprivation; Social Isolation' },
          { label: 'Optimal Diagnostic Criteria', value: 'Frantic efforts to avoid real or imagined abandonment' },
        ],
      },
      {
        name: 'Histrionic', color: '#7DA8E0',
        details: [
          { label: 'Trigger', value: 'Demands to be the center of attention / situations where not noticed' },
          { label: 'Behavioral Style', value: 'Self-dramatization; suggestibility; charming and excitement-seeking; needs to attract others\' attention' },
          { label: 'Interpersonal Style', value: 'Seductive or provocative interactions; exhibitionistic and/or flirtatious; misreads intimacy of relationships' },
          { label: 'Cognitive Style', value: 'Impulsive; thematic, field-dependent; impressionistic style of speech' },
          { label: 'Feeling Style', value: 'Rapidly shifting, shallow expression of emotions; exaggerated emotional display' },
          { label: 'Temperament', value: 'Hyperresponsive infantile pattern; externally oriented for gratification' },
          { label: 'Self-View', value: '“I need to be noticed”' },
          { label: 'World View', value: '“Life makes me so nervous, so I\'m entitled to special care and consideration”' },
          { label: 'Maladaptive Schemas', value: 'Approval-Seeking; Emotional Deprivation; Defectiveness' },
          { label: 'Optimal Diagnostic Criteria', value: 'Is uncomfortable in situations in which he or she is not the center of attention' },
        ],
      },
      {
        name: 'Overt Narcissist', color: '#E05858',
        details: [
          { label: 'Trigger', value: 'Challenges to grandiosity or status' },
          { label: 'Behavioral Style', value: 'Openly grandiose; dominant, self-assured, exhibitionistic; requires admiration' },
          { label: 'Interpersonal Style', value: 'Oblivious to others\' needs; exploitative; immodest; refuses to comply with authority; high-risk, face-to-face aggression toward high-ranking targets' },
          { label: 'Cognitive Style', value: 'Superiority, self-confidence, optimism; expansiveness and exaggeration' },
          { label: 'Feeling Style', value: 'High self-esteem; low anxiety/depression; narcissistic rage when challenged' },
          { label: 'Temperament', value: 'Agentic extraversion (high-energy, dominant)' },
          { label: 'Self-View', value: '“I am superior, exceptional, and admired”' },
          { label: 'World View', value: 'The world is a stage for my specialness; people owe me admiration' },
          { label: 'Maladaptive Schemas', value: 'Entitlement; Unrelenting Standards; Insufficient Self-Control' },
          { label: 'Optimal Diagnostic Criteria', value: 'Grandiose, dominant, openly exploitative and attention-seeking presentation' },
        ],
      },
      {
        name: 'Covert Narcissist', color: '#E08AB8',
        details: [
          { label: 'Trigger', value: 'Perceived slights, criticism, or evaluation by others' },
          { label: 'Behavioral Style', value: 'Inhibited, shy, self-effacing outwardly; defensive; introverted' },
          { label: 'Interpersonal Style', value: 'Hypersensitive to slights; distrustful, hostile interpersonal style; withdraws; reactive/anonymous aggression' },
          { label: 'Cognitive Style', value: 'Covertly grandiose; preoccupied with possible failure; self-doubt; constant comparison to others' },
          { label: 'Feeling Style', value: 'Inadequacy, diffidence; chronic envy; high neuroticism, negative affect, anxiety, depression' },
          { label: 'Temperament', value: 'Neurotic, introverted, hyperreactive-to-evaluation pattern' },
          { label: 'Self-View', value: 'Outwardly inadequate, inwardly entitled/special; fragile, low self-esteem' },
          { label: 'World View', value: 'Others judge and fail to recognize my hidden specialness' },
          { label: 'Maladaptive Schemas', value: 'Defectiveness; Emotional Deprivation; Entitlement (covert); Vulnerability to Harm' },
          { label: 'Optimal Diagnostic Criteria', value: 'Hypersensitive, socially withdrawn presentation masking covert grandiosity' },
        ],
      },
      {
        name: 'Inverted Narcissist', color: '#E89048',
        details: [
          { label: 'Trigger', value: 'Absence of a narcissist to attach to; threatened abandonment by the narcissistic partner' },
          { label: 'Behavioral Style', value: 'Needy, demanding, submissive; clinging; immature behaviors to preserve the bond; remains despite abuse' },
          { label: 'Interpersonal Style', value: 'Depends EXCLUSIVELY on narcissists; actively seeks only narcissistic partners; feels empty/unhappy with non-narcissists' },
          { label: 'Cognitive Style', value: 'Derives all self-worth from outside; preempts the narcissist by berating her own achievements' },
          { label: 'Feeling Style', value: 'Pathologically envious; chronic low self-esteem; more emotionally level than the classic narcissist; intermittent aggression' },
          { label: 'Temperament', value: 'Stable but low self-worth (does NOT fluctuate like the overt narcissist\'s)' },
          { label: 'Self-View', value: 'Rigid, stable sense of LACK of self-worth; devalues self as a sacrifice/offering to the narcissist' },
          { label: 'World View', value: 'I exist through and for the narcissist; abuse is the price of the bond' },
          { label: 'Maladaptive Schemas', value: 'Subjugation; Self-Sacrifice; Abandonment; Defectiveness' },
          { label: 'Optimal Diagnostic Criteria', value: 'Covert narcissism organized around exclusive codependent attachment to a narcissist (mirror-image: self-devaluation in place of grandiosity)' },
        ],
      },
      {
        name: 'Communal Narcissist', color: '#E8C84A',
        details: [
          { label: 'Trigger', value: 'Challenges to one\'s image as exceptionally caring, moral, or helpful' },
          { label: 'Behavioral Style', value: 'Grandiosity expressed through prosocial display; conspicuous helping, generosity, virtue-signalling' },
          { label: 'Interpersonal Style', value: 'Seeks admiration via communal roles (“most caring/giving”); uses warmth and goodness as status; underlying entitlement and low concern for others' },
          { label: 'Cognitive Style', value: '“I am the most helpful / trustworthy / moral person”; inflated communal self-view' },
          { label: 'Feeling Style', value: 'Gratified by moral admiration; rage/withdrawal when virtue is unrecognized or questioned' },
          { label: 'Temperament', value: 'Agentic drive channeled into communal arena' },
          { label: 'Self-View', value: '“I am extraordinarily kind, generous, and good”' },
          { label: 'World View', value: 'People should recognize and reward my exceptional goodness' },
          { label: 'Maladaptive Schemas', value: 'Self-Sacrifice (as display); Approval-Seeking; Entitlement' },
          { label: 'Optimal Diagnostic Criteria', value: 'Narcissism with same entitlement/admiration-need core, expressed through communal rather than agentic means' },
        ],
      },
      {
        name: 'Malignant Narcissist', color: '#9A6FC0',
        details: [
          { label: 'Trigger', value: 'Challenges to dominance, control, or superiority' },
          { label: 'Behavioral Style', value: 'Typical NPD symptoms plus prominent antisocial behavior; chronic lying and intimidation' },
          { label: 'Interpersonal Style', value: 'Sadism toward others; pursues financial/interpersonal secondary gains; paranoid features' },
          { label: 'Cognitive Style', value: 'Grandiose and suspicious; paranoid interpretation of others\' motives' },
          { label: 'Feeling Style', value: 'Narcissistic rage fused with sadistic gratification (pleasure in domination)' },
          { label: 'Temperament', value: 'Aggressive, dominant, low-empathy pattern' },
          { label: 'Self-View', value: '“I am superior and entitled to dominate”' },
          { label: 'World View', value: 'The world is hostile and beneath me; dominate or be dominated' },
          { label: 'Maladaptive Schemas', value: 'Entitlement; Mistrust/Abuse; Punitiveness' },
          { label: 'Optimal Diagnostic Criteria', value: 'NPD + antisocial behavior + paranoid features + sadism (Kernberg\'s “malignant narcissism”)' },
        ],
      },
    ],
  },
  {
    key: 'mbti',
    name: 'Personality Types (Myers-Briggs)',
    blurb: 'Framework sources: Jung (cognitive functions) · Myers & Briggs (16-type structure) · Keirsey (temperament grouping).',
    sources: 'Not affiliated with or endorsed by The Myers & Briggs Foundation. “MBTI” and “Myers-Briggs” are trademarks of the Foundation.',
    items: [
      {
        name: 'INFJ', color: '#3E8A5F',
        details: [
          { label: 'Temperament', value: 'Idealist' },
          { label: 'Core Preferences', value: 'Introverted, Intuitive, Feeling, Judging. Inner-focused, abstract, values-driven, decisive about conclusions while private about the process.' },
          { label: 'Cognitive Functions', value: 'Ni (dom), Fe (aux), Ti (tert), Se (inf). A long-arc pattern-synthesizer that lands on one quiet conviction, delivered through attunement to others\' emotions.' },
          { label: 'Strengths', value: 'Reads people and undercurrents before they\'re spoken; fuses unrelated ideas into a coherent vision; empathy paired with sharp insight; quietly resilient, turning private struggle into purpose.' },
          { label: 'Blind Spots', value: 'Perfectionism and harsh self-criticism; burnout from impossible standards; weak Se neglects present detail, tactical reactivity, and bodily needs; over-lives in \'what will be.\'' },
          { label: 'Interpersonal Style', value: 'Few but deep bonds; warm yet selective; a natural mediator who senses unspoken suffering; guards the inner world even with intimates.' },
          { label: 'Decision / Work Style', value: 'Pre-processes internally, then acts with surprising firmness; values-aligned, meaning-driven work; needs autonomy and quiet.' },
          { label: 'Growth', value: 'Letting \'good enough\' be enough; grounding in the present and body (developing Se); voicing the inner process instead of arriving fully-formed and unreadable.' },
        ],
      },
      {
        name: 'INFP', color: '#3E8A5F',
        details: [
          { label: 'Temperament', value: 'Idealist' },
          { label: 'Core Preferences', value: 'Introverted, Intuitive, Feeling, Perceiving. Inward, abstract, guided by deep personal values, and flexible rather than structured.' },
          { label: 'Cognitive Functions', value: 'Fi (dom), Ne (aux), Si (tert), Te (inf). A private moral compass that evaluates everything against deeply held values, branching into possibilities.' },
          { label: 'Strengths', value: 'Strong, authentic value system; deep empathy without losing self; imaginative and idea-rich; sensitive to hypocrisy and to meaning others miss.' },
          { label: 'Blind Spots', value: 'Idealism collides with reality; conflict-avoidant; weak Te makes structure, follow-through, and external organization hard; under stress turns harshly self-critical.' },
          { label: 'Interpersonal Style', value: 'Gentle, accepting, loyal to a chosen few; reserved about private convictions; bonds over shared meaning and authenticity.' },
          { label: 'Decision / Work Style', value: 'Decides by inner resonance (\'does this feel right?\'); needs work aligned with values; resists rigid systems and deadlines.' },
          { label: 'Growth', value: 'Building external structure and follow-through (developing Te); acting on ideals rather than only feeling them; tolerating imperfection in self and world.' },
        ],
      },
      {
        name: 'ENFJ', color: '#3E8A5F',
        details: [
          { label: 'Temperament', value: 'Idealist' },
          { label: 'Core Preferences', value: 'Extraverted, Intuitive, Feeling, Judging. Outward, abstract, people-oriented, and organized toward shared goals.' },
          { label: 'Cognitive Functions', value: 'Fe (dom), Ni (aux), Se (tert), Ti (inf). Reads and shapes the group\'s emotional field, guided by an intuitive vision of people\'s potential.' },
          { label: 'Strengths', value: 'Inspiring and persuasive; deeply attuned to others\' needs; develops people and builds consensus; charismatic, organized, future-oriented.' },
          { label: 'Blind Spots', value: 'Over-involved in others\' lives; neglects own needs; conflict-averse to the point of self-erasure; weak Ti means over-personalizing and circular self-analysis under stress.' },
          { label: 'Interpersonal Style', value: 'Warm, engaging, mentoring; naturally takes responsibility for group harmony; thrives on connection and being needed.' },
          { label: 'Decision / Work Style', value: 'Decides with the group\'s wellbeing front of mind; mobilizes people toward a vision; strong at coordination and motivation.' },
          { label: 'Growth', value: 'Setting boundaries and tending own needs; tolerating disapproval; trusting impersonal logic (developing Ti) alongside empathy.' },
        ],
      },
      {
        name: 'ENFP', color: '#3E8A5F',
        details: [
          { label: 'Temperament', value: 'Idealist' },
          { label: 'Core Preferences', value: 'Extraverted, Intuitive, Feeling, Perceiving. Outward, abstract, values-led, and open-endedly flexible.' },
          { label: 'Cognitive Functions', value: 'Ne (dom), Fi (aux), Te (tert), Si (inf). A possibility-generator that scans connections everywhere, anchored by personal values.' },
          { label: 'Strengths', value: 'Infectious enthusiasm; sees potential and connection others miss; warm, curious, adaptable; rallies people around new ideas.' },
          { label: 'Blind Spots', value: 'Starts more than it finishes; restless with routine and detail; weak Si means neglected follow-through and bodily upkeep; scattered when over-stimulated.' },
          { label: 'Interpersonal Style', value: 'Magnetic, affirming, broadly connected; makes people feel seen; bonds fast over shared excitement and meaning.' },
          { label: 'Decision / Work Style', value: 'Explores options widely before committing; energized by novelty and people; struggles with repetitive, structured tasks.' },
          { label: 'Growth', value: 'Following through and grounding in routine (developing Si); converting ideas into completed action; managing the urge to chase the next spark.' },
        ],
      },
      {
        name: 'INTJ', color: '#7E4FA0',
        details: [
          { label: 'Temperament', value: 'Rational' },
          { label: 'Core Preferences', value: 'Introverted, Intuitive, Thinking, Judging. Inward, abstract, logic-driven, decisive and strategic.' },
          { label: 'Cognitive Functions', value: 'Ni (dom), Te (aux), Fi (tert), Se (inf). Convergent long-range vision executed through efficient external systems.' },
          { label: 'Strengths', value: 'Strategic foresight; independent and decisive; builds and optimizes systems toward a goal; near-imperviousness to social pressure once convinced.' },
          { label: 'Blind Spots', value: 'Dismissive of others\' input; impatient with inefficiency; weak Se neglects present realities and the body; can over-trust a single internal vision.' },
          { label: 'Interpersonal Style', value: 'Selective, reserved, direct; values competence over warmth; small circle of respected peers; little patience for small talk.' },
          { label: 'Decision / Work Style', value: 'Decides early and commits; plans long-horizon then implements ruthlessly; autonomy-driven and goal-fixated.' },
          { label: 'Growth', value: 'Inviting input and softening certainty; engaging the present and body (developing Se); valuing relational warmth alongside results.' },
        ],
      },
      {
        name: 'INTP', color: '#7E4FA0',
        details: [
          { label: 'Temperament', value: 'Rational' },
          { label: 'Core Preferences', value: 'Introverted, Intuitive, Thinking, Perceiving. Inward, abstract, logic-precise, and open-endedly exploratory.' },
          { label: 'Cognitive Functions', value: 'Ti (dom), Ne (aux), Si (tert), Fe (inf). Builds precise internal frameworks, fed by expansive possibility-generation.' },
          { label: 'Strengths', value: 'Rigorous logical analysis; spots inconsistency instantly; original, theory-rich thinking; intellectually honest and independent.' },
          { label: 'Blind Spots', value: 'Endless analysis without action; detached from practical follow-through; weak Fe means social/emotional missteps and sudden sensitivity under stress.' },
          { label: 'Interpersonal Style', value: 'Reserved, candid, low-maintenance; engages through ideas and debate; awkward with emotional expression but loyal to the few.' },
          { label: 'Decision / Work Style', value: 'Resolves logical inconsistency before acting; explores frameworks at length; resists arbitrary structure and deadlines.' },
          { label: 'Growth', value: 'Acting before the model is perfect; developing social-emotional attunement (Fe); grounding theory in real-world application.' },
        ],
      },
      {
        name: 'ENTJ', color: '#7E4FA0',
        details: [
          { label: 'Temperament', value: 'Rational' },
          { label: 'Core Preferences', value: 'Extraverted, Intuitive, Thinking, Judging. Outward, abstract, logic-driven, organized and commanding.' },
          { label: 'Cognitive Functions', value: 'Te (dom), Ni (aux), Se (tert), Fi (inf). Organizes the external world efficiently, steered by long-range strategic vision.' },
          { label: 'Strengths', value: 'Decisive leadership; strategic and efficient; turns vision into structured execution; confident, resilient to criticism, drives results.' },
          { label: 'Blind Spots', value: 'Blunt, impatient, domineering; overrides others\' feelings; neglects health and balance; weak Fi means sudden value-crises and feeling like a fraud under stress.' },
          { label: 'Interpersonal Style', value: 'Direct, assertive, energizing; respects competence and challenge; takes charge naturally; can read as harsh.' },
          { label: 'Decision / Work Style', value: 'Closes on decisions fast; builds systems and mobilizes people toward goals; thrives in high-stakes leadership.' },
          { label: 'Growth', value: 'Tending feelings and relationships (developing Fi); building in rest and balance; softening bluntness into influence.' },
        ],
      },
      {
        name: 'ENTP', color: '#7E4FA0',
        details: [
          { label: 'Temperament', value: 'Rational' },
          { label: 'Core Preferences', value: 'Extraverted, Intuitive, Thinking, Perceiving. Outward, abstract, logic-led, and restlessly flexible.' },
          { label: 'Cognitive Functions', value: 'Ne (dom), Ti (aux), Fe (tert), Si (inf). Generates possibilities prolifically, stress-tested against an internal logical framework.' },
          { label: 'Strengths', value: 'Quick, inventive, intellectually fearless; sees angles and connections fast; persuasive debater; thrives on novelty and challenge.' },
          { label: 'Blind Spots', value: 'Argues for sport; starts more than it finishes; weak Si neglects routine, detail, follow-through, and health; bored by maintenance.' },
          { label: 'Interpersonal Style', value: 'Charismatic, provocative, playful; bonds through banter and idea-jousting; enjoys challenging others\' thinking.' },
          { label: 'Decision / Work Style', value: 'Keeps options open and explores alternatives long; energized by problem-solving and debate; resists closure and routine.' },
          { label: 'Growth', value: 'Following through and respecting detail (developing Si); knowing when to stop debating and commit; honoring others\' feelings.' },
        ],
      },
      {
        name: 'ISTJ', color: '#3E6B8A',
        details: [
          { label: 'Temperament', value: 'Guardian' },
          { label: 'Core Preferences', value: 'Introverted, Sensing, Thinking, Judging. Inward, concrete, logic-driven, and firmly structured.' },
          { label: 'Cognitive Functions', value: 'Si (dom), Te (aux), Fi (tert), Ne (inf). Compares the present against proven past experience, organized through efficient logic.' },
          { label: 'Strengths', value: 'Reliable, thorough, responsible; strong memory for fact and procedure; consistent and dutiful; finishes what they start.' },
          { label: 'Blind Spots', value: 'Rigid about change and new methods; over-attached to \'how it\'s always been\'; weak Ne catastrophizes about the future under stress.' },
          { label: 'Interpersonal Style', value: 'Loyal, steady, private; shows care through dependability more than words; honors commitments and tradition.' },
          { label: 'Decision / Work Style', value: 'Decides by precedent and proven data; methodical, detail-exact, deadline-respecting; excels in stable, defined systems.' },
          { label: 'Growth', value: 'Staying open to new approaches (developing Ne); accepting change isn\'t a threat; voicing feelings rather than burying them.' },
        ],
      },
      {
        name: 'ISFJ', color: '#3E6B8A',
        details: [
          { label: 'Temperament', value: 'Guardian' },
          { label: 'Core Preferences', value: 'Introverted, Sensing, Feeling, Judging. Inward, concrete, people-warm, and dependably structured.' },
          { label: 'Cognitive Functions', value: 'Si (dom), Fe (aux), Ti (tert), Ne (inf). Anchored in remembered experience, attuned to others\' needs and harmony.' },
          { label: 'Strengths', value: 'Devoted, attentive, conscientious; remembers and meets others\' practical needs; patient and loyal; quietly hardworking.' },
          { label: 'Blind Spots', value: 'Self-sacrificing to a fault; avoids conflict and overlooks own needs; resistant to change; weak Ne breeds anxious worst-case thinking.' },
          { label: 'Interpersonal Style', value: 'Nurturing, gentle, behind-the-scenes; expresses care through service; deeply loyal to family and close circle.' },
          { label: 'Decision / Work Style', value: 'Decides by what\'s worked and who\'s affected; meticulous and reliable; prefers clear roles and stable routines.' },
          { label: 'Growth', value: 'Asserting own needs and setting boundaries; embracing change (developing Ne); accepting appreciation without guilt.' },
        ],
      },
      {
        name: 'ESTJ', color: '#3E6B8A',
        details: [
          { label: 'Temperament', value: 'Guardian' },
          { label: 'Core Preferences', value: 'Extraverted, Sensing, Thinking, Judging. Outward, concrete, logic-driven, and decisively organized.' },
          { label: 'Cognitive Functions', value: 'Te (dom), Si (aux), Ne (tert), Fi (inf). Organizes the external world by objective standards, grounded in proven experience.' },
          { label: 'Strengths', value: 'Decisive, dependable organizer; enforces structure and gets things done; strong sense of duty and standards; natural administrator.' },
          { label: 'Blind Spots', value: 'Rigid and controlling; dismissive of emotions and unproven ideas; weak Fi means hypersensitivity and emotional reactivity under stress.' },
          { label: 'Interpersonal Style', value: 'Direct, authoritative, sociable; values order and reliability; takes charge of practical matters; can steamroll feelings.' },
          { label: 'Decision / Work Style', value: 'Decides fast by logic and precedent; implements efficiently; thrives running defined operations and teams.' },
          { label: 'Growth', value: 'Honoring emotions and values (developing Fi); flexing on \'the right way\'; listening before correcting.' },
        ],
      },
      {
        name: 'ESFJ', color: '#3E6B8A',
        details: [
          { label: 'Temperament', value: 'Guardian' },
          { label: 'Core Preferences', value: 'Extraverted, Sensing, Feeling, Judging. Outward, concrete, people-centered, and warmly organized.' },
          { label: 'Cognitive Functions', value: 'Fe (dom), Si (aux), Ne (tert), Ti (inf). Reads and tends the group\'s emotional needs, grounded in tradition and experience.' },
          { label: 'Strengths', value: 'Warm, sociable, dependable; creates harmony and takes care of practical needs; loyal, organized, community-minded.' },
          { label: 'Blind Spots', value: 'Needs approval; conflict-avoidant; over-attentive to others\' opinions; weak Ti means circular over-analysis and lost warmth under stress.' },
          { label: 'Interpersonal Style', value: 'Generous, attentive, hospitable; remembers and meets social needs; thrives on belonging and being useful.' },
          { label: 'Decision / Work Style', value: 'Decides by group harmony and convention; organized and service-oriented; prefers clear, cooperative structures.' },
          { label: 'Growth', value: 'Acting on own values regardless of approval; tolerating conflict; trusting impersonal logic (developing Ti).' },
        ],
      },
      {
        name: 'ISTP', color: '#C2913B',
        details: [
          { label: 'Temperament', value: 'Artisan' },
          { label: 'Core Preferences', value: 'Introverted, Sensing, Thinking, Perceiving. Inward, concrete, logic-precise, and flexibly hands-on.' },
          { label: 'Cognitive Functions', value: 'Ti (dom), Se (aux), Ni (tert), Fe (inf). Builds internal logical models, applied through sharp real-time sensory action.' },
          { label: 'Strengths', value: 'Cool under pressure; masterful with tools, systems, and mechanics; pragmatic problem-solver; independent and unflappable.' },
          { label: 'Blind Spots', value: 'Detached and hard to read; impatient with rules and long commitments; weak Fe means missing/ignoring emotional cues, sudden outbursts under stress.' },
          { label: 'Interpersonal Style', value: 'Private, low-key, autonomous; shows up through competent action, not words; bonds over shared activity.' },
          { label: 'Decision / Work Style', value: 'Decides by hands-on logic in the moment; learns by doing; thrives troubleshooting concrete problems, resists bureaucracy.' },
          { label: 'Growth', value: 'Developing emotional awareness and expression (Fe); committing beyond the immediate; communicating rather than withdrawing.' },
        ],
      },
      {
        name: 'ISFP', color: '#C2913B',
        details: [
          { label: 'Temperament', value: 'Artisan' },
          { label: 'Core Preferences', value: 'Introverted, Sensing, Feeling, Perceiving. Inward, concrete, values-led, and gently flexible.' },
          { label: 'Cognitive Functions', value: 'Fi (dom), Se (aux), Ni (tert), Te (inf). A quiet, deep value system expressed through immediate sensory and aesthetic experience.' },
          { label: 'Strengths', value: 'Authentic and gentle; keen aesthetic and sensory sense; lives in the present; warm, accepting, quietly principled.' },
          { label: 'Blind Spots', value: 'Avoids conflict and long-range planning; hard to know; weak Te makes structure and follow-through difficult; self-critical under stress.' },
          { label: 'Interpersonal Style', value: 'Soft-spoken, kind, loyal to a few; shows love through action and presence; needs space and authenticity.' },
          { label: 'Decision / Work Style', value: 'Decides by personal values and present feel; hands-on and experiential; resists rigid systems and abstraction.' },
          { label: 'Growth', value: 'Building structure and long-term follow-through (developing Te); voicing values and needs; tolerating conflict.' },
        ],
      },
      {
        name: 'ESTP', color: '#C2913B',
        details: [
          { label: 'Temperament', value: 'Artisan' },
          { label: 'Core Preferences', value: 'Extraverted, Sensing, Thinking, Perceiving. Outward, concrete, logic-driven, and built for the live moment.' },
          { label: 'Cognitive Functions', value: 'Se (dom), Ti (aux), Fe (tert), Ni (inf). A real-time environment-reader that acts fast and reasons on the fly.' },
          { label: 'Strengths', value: 'Exceptional situational awareness; cool and decisive under pressure; persuasive and socially fluid; learns by doing, turns obstacles into action.' },
          { label: 'Blind Spots', value: 'Impatient with theory and planning; risk- and thrill-chasing; weak Ni underweights future consequences and patterns; can steamroll feelings.' },
          { label: 'Interpersonal Style', value: 'Charming, direct, energizing; thrives in groups; connects through shared activity and banter; reads the room instantly.' },
          { label: 'Decision / Work Style', value: 'Pragmatic and fast; solves the problem in front of them with whatever works; hates rigid structure; best hands-on and high-stakes.' },
          { label: 'Growth', value: 'Building the long view (developing Ni); pausing before impulse; valuing depth and follow-through over the next stimulus.' },
        ],
      },
      {
        name: 'ESFP', color: '#C2913B',
        details: [
          { label: 'Temperament', value: 'Artisan' },
          { label: 'Core Preferences', value: 'Extraverted, Sensing, Feeling, Perceiving. Outward, concrete, people-warm, and spontaneously flexible.' },
          { label: 'Cognitive Functions', value: 'Se (dom), Fi (aux), Te (tert), Ni (inf). Lives fully in the sensory present, steered by personal values.' },
          { label: 'Strengths', value: 'Vivacious, fun, fully present; reads and lifts a room; practical and generous; adapts fast and enjoys life out loud.' },
          { label: 'Blind Spots', value: 'Avoids the abstract and the long-term; conflict- and boredom-averse; weak Ni misses consequences; over-indulgent or scattered under stress.' },
          { label: 'Interpersonal Style', value: 'Outgoing, affectionate, spontaneous; makes others feel good; bonds through shared experience and warmth.' },
          { label: 'Decision / Work Style', value: 'Decides by present feel and values; hands-on, people-facing, immediate; resists theory and rigid planning.' },
          { label: 'Growth', value: 'Developing foresight (Ni); planning beyond the moment; sitting with discomfort instead of chasing the next high.' },
        ],
      },
    ],
  },
];

function BuilderModal({ initialCategory, initialItems, onClose, onSave }) {
  const [catName, setCatName] = useState(initialCategory ? initialCategory.name : '');
  const [items, setItems] = useState(
    initialItems && initialItems.length ? initialItems.map(it => ({ ...it })) : []
  );

  const addItem = () => setItems([...items, { id: newId(), name: '', color: PATTERN_COLORS[items.length % PATTERN_COLORS.length], description: '' }]);
  const updateItem = (id, field, val) => setItems(items.map(it => it.id === id ? { ...it, [field]: val } : it));
  const removeItem = (id) => setItems(items.filter(it => it.id !== id));

  const canSave = catName.trim() && items.length > 0 && items.every(it => it.name.trim());

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={{ fontFamily: 'Georgia, serif', fontSize: '22px', fontWeight: '300', color: '#D8E6F0' }}>
            {initialCategory ? 'Edit Pattern' : 'New Pattern'}
          </div>
          <button style={styles.x} onClick={onClose}></button>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <div style={styles.fieldLabel}>Category name</div>
          <input style={styles.input} value={catName} onChange={e => setCatName(e.target.value)} placeholder="e.g. Attachment Theory" autoFocus />
        </div>

        <div style={styles.fieldLabel}>Items</div>
        {items.length === 0 && <div style={styles.itemsEmpty}>No items yet. Add the first one below.</div>}

        {items.map(it => (
          <div key={it.id} style={styles.itemBlock}>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '10px' }}>
              <input style={{ ...styles.input, flex: 1 }} value={it.name} onChange={e => updateItem(it.id, 'name', e.target.value)} placeholder="Item name (e.g. Secure)" />
              <button style={styles.removeItemBtn} onClick={() => removeItem(it.id)}>Remove</button>
            </div>
            <div style={styles.miniLabel}>Color</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '10px' }}>
              {PATTERN_COLORS.map(c => (
                <div key={c} onClick={() => updateItem(it.id, 'color', c)}
                  style={{ width: '22px', height: '22px', borderRadius: '50%', background: c, cursor: 'pointer',
                    border: it.color === c ? '2px solid #D8E6F0' : '2px solid transparent',
                    boxShadow: it.color === c ? '0 0 6px rgba(216,230,240,0.4)' : 'none' }} />
              ))}
            </div>
            <div style={styles.miniLabel}>Description <span style={{ textTransform: 'none', letterSpacing: 0, fontWeight: 400 }}> optional</span></div>
            <textarea style={{ ...styles.input, minHeight: '54px', resize: 'vertical', fontFamily: 'Georgia, serif' }}
              value={it.description || ''} onChange={e => updateItem(it.id, 'description', e.target.value)}
              placeholder="A short description shown when this item is tapped." />
          </div>
        ))}

        <button style={styles.addItemBtn} onClick={addItem}>+ Add item</button>

        <div style={styles.modalFooter}>
          <button style={styles.cancelBtn} onClick={onClose}>Cancel</button>
          <button style={{ ...styles.confirmBtn, opacity: canSave ? 1 : 0.4, cursor: canSave ? 'pointer' : 'not-allowed' }} disabled={!canSave} onClick={() => onSave(catName.trim(), items)}>Save</button>
        </div>
      </div>
    </div>
  );
}

function ItemDetailModal({ item, categoryName, onClose }) {
  if (!item) return null;
  const hasDetails = Array.isArray(item.details) && item.details.length > 0;
  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={{ ...styles.modal, maxWidth: '480px' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div>
            <div style={{ fontSize: '9px', fontWeight: '600', letterSpacing: '2px', textTransform: 'uppercase', color: '#8BAFC8', marginBottom: '6px' }}>{categoryName}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ width: '14px', height: '14px', borderRadius: '50%', background: item.color, flexShrink: 0 }} />
              <span style={{ fontFamily: 'Georgia, serif', fontSize: '22px', fontWeight: '300', color: '#D8E6F0' }}>{item.name}</span>
            </div>
          </div>
          <button style={styles.x} onClick={onClose}></button>
        </div>

        {hasDetails ? (
          <div style={{ marginTop: '8px' }}>
            {item.details.map((d, i) => (
              (d.value && d.value.trim()) ? (
                <div key={i} style={{ marginBottom: '16px' }}>
                  <div style={{ fontSize: '9px', fontWeight: '600', letterSpacing: '2px', textTransform: 'uppercase', color: '#8BAFC8', marginBottom: '5px' }}>{d.label}</div>
                  <div style={{ fontSize: '13px', color: '#D8E6F0', fontFamily: 'Georgia, serif', lineHeight: 1.65 }}>{d.value}</div>
                </div>
              ) : null
            ))}
          </div>
        ) : (
          <div style={{ fontSize: '14px', color: '#D8E6F0', fontFamily: 'Georgia, serif', lineHeight: 1.7, marginTop: '8px' }}>
            {item.description && item.description.trim() ? item.description : <span style={{ color: '#8BAFC8', fontStyle: 'italic' }}>No description yet.</span>}
          </div>
        )}
      </div>
    </div>
  );
}

function HowItWorksModal({ onClose }) {
  const para = { fontSize: '13px', lineHeight: 1.75, color: '#B3C9DA', margin: '0 0 14px' };
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 300, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', overflowY: 'auto', padding: '40px 20px' }} onClick={onClose}>
      <div style={{ background: '#162534', border: '1px solid rgba(142,196,224,0.3)', borderRadius: '4px', width: '100%', maxWidth: '720px', padding: '32px', boxShadow: '0 0 40px rgba(0,0,0,0.6)' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '4px' }}>
          <div>
            <div style={{ fontFamily: 'Georgia, serif', fontSize: '22px', fontWeight: '300', color: '#D8E6F0' }}>How It Works</div>
            <div style={{ fontSize: '10px', fontWeight: '600', letterSpacing: '3px', textTransform: 'uppercase', color: '#8BAFC8', marginTop: '4px' }}>Pattern Library</div>
          </div>
          <button style={{ background: 'none', border: 'none', color: '#8BAFC8', cursor: 'pointer', fontSize: '18px' }} onClick={onClose}>✕</button>
        </div>
        <p style={{ ...para, marginTop: '18px' }}>
          Patterns connect to the people on your Relational Map. To add one, adopt a pre-built pattern from the library below, or build your own. To view a pattern, open the Relational Map and select it from the View by filter.
        </p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
          <button style={{ background: 'rgba(142,196,224,0.15)', border: '1px solid rgba(142,196,224,0.4)', borderRadius: '3px', padding: '10px 24px', color: '#8EC4E0', fontSize: '11px', fontWeight: '600', letterSpacing: '2px', textTransform: 'uppercase', cursor: 'pointer' }} onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

function Patterns() {
  // eslint-disable-next-line no-unused-vars
  const navigate = useNavigate();
  const token = localStorage.getItem('axis_token');
  const [categories, setCategories] = useState([]);
  const [patterns, setPatterns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showInfo, setShowInfo] = useState(false);
  const [builderOpen, setBuilderOpen] = useState(false);
  const [editingCat, setEditingCat] = useState(null);
  const [detailItem, setDetailItem] = useState(null);
  const [detailCatName, setDetailCatName] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const [catsRes, patternsRes] = await Promise.all([
          axios.get(`${API}/api/pattern-categories`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${API}/api/patterns`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        setCategories(catsRes.data || []);
        setPatterns(patternsRes.data || []);
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const saveCategories = async (updated) => {
    await axios.post(`${API}/api/pattern-categories`, { data: updated }, { headers: { Authorization: `Bearer ${token}` } });
    setCategories(updated);
  };
  const savePatterns = async (updated) => {
    await axios.post(`${API}/api/patterns`, { data: updated }, { headers: { Authorization: `Bearer ${token}` } });
    setPatterns(updated);
  };

  const adoptPreset = async (preset) => {
    const exists = categories.some(c => c.name.toLowerCase() === preset.name.toLowerCase());
    if (exists && !window.confirm(`You already have a "${preset.name}" category. Add another copy?`)) return;
    const catId = newId();
    const newCat = { id: catId, name: preset.name, order: categories.length };
    const newPatterns = preset.items.map(it => ({ id: newId(), categoryId: catId, name: it.name, color: it.color, description: it.description || '', details: it.details || null }));
    await saveCategories([...categories, newCat]);
    await savePatterns([...patterns, ...newPatterns]);
  };

  const removeCategory = async (cat) => {
    const count = patterns.filter(p => p.categoryId === cat.id).length;
    if (!window.confirm(`Remove "${cat.name}" and its ${count} item${count === 1 ? '' : 's'}? People assigned to it will lose this tag. This cannot be undone.`)) return;
    await saveCategories(categories.filter(c => c.id !== cat.id));
    await savePatterns(patterns.filter(p => p.categoryId !== cat.id));
  };

  const openNewBuilder = () => { setEditingCat(null); setBuilderOpen(true); };
  const openEditBuilder = (cat) => { setEditingCat(cat); setBuilderOpen(true); };

  const handleBuilderSave = async (name, items) => {
    if (editingCat) {
      const updatedCats = categories.map(c => c.id === editingCat.id ? { ...c, name } : c);
      const others = patterns.filter(p => p.categoryId !== editingCat.id);
      const rebuilt = items.map(it => ({ id: it.id || newId(), categoryId: editingCat.id, name: it.name.trim(), color: it.color, description: it.description || '', details: it.details || null }));
      await saveCategories(updatedCats);
      await savePatterns([...others, ...rebuilt]);
    } else {
      const catId = newId();
      const newCat = { id: catId, name, order: categories.length };
      const newItems = items.map(it => ({ id: newId(), categoryId: catId, name: it.name.trim(), color: it.color, description: it.description || '', details: it.details || null }));
      await saveCategories([...categories, newCat]);
      await savePatterns([...patterns, ...newItems]);
    }
    setBuilderOpen(false);
    setEditingCat(null);
  };

  if (loading) return <div style={{ color: '#8BAFC8', padding: '48px', textAlign: 'center' }}>Loading...</div>;

  const adoptedNames = new Set(categories.map(c => c.name.toLowerCase()));

  return (
    <Page>
      {showInfo && <HowItWorksModal onClose={() => setShowInfo(false)} />}
      <AppHeader title="Pattern Library" right={<button style={styles.addBtn} onClick={openNewBuilder}>+ New Pattern</button>} />
      <PageBody width="content">

        <div style={{ marginBottom: '16px' }}>
          <button style={styles.infoTrigger} onClick={() => setShowInfo(true)}>
            <span style={styles.infoTriggerIcon}>i</span> How it works
          </button>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <div style={styles.sectionTitle}>Your Patterns</div>
          <div style={styles.sectionSub}>The pattern categories you've built. Assigned to people on the Relational Map.</div>
        </div>

        {categories.length === 0 ? (
          <div style={styles.empty}>No patterns yet. Build your own with “+ New Pattern”, or adopt one from the Library below.</div>
        ) : (
          <div style={styles.cardGrid}>
            {categories.map(cat => {
              const items = patterns.filter(p => p.categoryId === cat.id);
              return (
                <div key={cat.id} style={styles.card}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                    <div style={styles.cardName}>{cat.name}</div>
                    <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                      <button style={styles.smallBtn} onClick={() => openEditBuilder(cat)}>Edit</button>
                      <button style={{ ...styles.smallBtn, color: '#C87878', borderColor: 'rgba(176,90,90,0.3)' }} onClick={() => removeCategory(cat)}>Remove</button>
                    </div>
                  </div>
                  <div style={{ ...styles.chipWrap, marginTop: '12px' }}>
                    {items.length === 0 ? (
                      <span style={styles.emptyChip}>No items yet</span>
                    ) : items.map(it => (
                      <span key={it.id} style={styles.chip} onClick={() => { setDetailItem(it); setDetailCatName(cat.name); }}>
                        <span style={{ ...styles.chipDot, background: it.color }} />
                        {it.name}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div style={{ marginTop: '56px', marginBottom: '20px' }}>
          <div style={styles.sectionTitle}>Pattern Library</div>
          <div style={styles.sectionSub}>Established frameworks, read through the AXIS lens. Adopt one to add it to your patterns, then tailor it.</div>
        </div>

        <div style={styles.cardGrid}>
          {PRESETS.map(preset => {
            const adopted = adoptedNames.has(preset.name.toLowerCase());
            return (
              <div key={preset.key} style={{ ...styles.card, ...styles.presetCard }}>
                <div style={styles.cardName}>{preset.name}</div>
                <div style={styles.presetBlurb}>{preset.blurb}</div>
                <div style={styles.chipWrap}>
                  {preset.items.map((it, i) => (
                    <span key={i} style={styles.chip} onClick={() => { setDetailItem(it); setDetailCatName(preset.name); }}>
                      <span style={{ ...styles.chipDot, background: it.color }} />
                      {it.name}
                    </span>
                  ))}
                </div>
                <div style={{ marginTop: '16px' }}>
                  <button style={adopted ? styles.adoptedBtn : styles.adoptBtn} onClick={() => adoptPreset(preset)}>
                    {adopted ? '✓ Adopted - add again' : '+ Adopt'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

      </PageBody>

      {builderOpen && (
        <BuilderModal initialCategory={editingCat}
          initialItems={editingCat ? patterns.filter(p => p.categoryId === editingCat.id) : []}
          onClose={() => { setBuilderOpen(false); setEditingCat(null); }} onSave={handleBuilderSave} />
      )}

      {detailItem && (
        <ItemDetailModal item={detailItem} categoryName={detailCatName} onClose={() => setDetailItem(null)} />
      )}
    </Page>
  );
}

const styles = {
  sectionTitle: { fontFamily: 'Georgia, serif', fontSize: '24px', fontWeight: '300', color: '#D8E6F0' },
  sectionSub: { fontSize: '12px', color: '#8BAFC8', marginTop: '6px', lineHeight: 1.5 },
  empty: { border: '1px dashed rgba(142,196,224,0.2)', borderRadius: '3px', padding: '40px', textAlign: 'center', fontSize: '13px', color: '#8BAFC8', fontStyle: 'italic', fontFamily: 'Georgia, serif' },
  cardGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' },
  card: { background: '#162534', border: '1px solid rgba(142,196,224,0.2)', borderRadius: '4px', padding: '20px 22px' },
  presetCard: { background: 'rgba(22,37,52,0.5)', borderStyle: 'dashed', borderColor: 'rgba(142,196,224,0.18)' },
  cardName: { fontFamily: 'Georgia, serif', fontSize: '17px', fontWeight: '300', color: '#D8E6F0', marginBottom: '8px' },
  presetBlurb: { fontSize: '11px', color: '#8BAFC8', lineHeight: 1.5, marginBottom: '14px', fontStyle: 'italic' },
  chipWrap: { display: 'flex', flexWrap: 'wrap', gap: '8px' },
  chip: { display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '5px 10px', borderRadius: '12px', background: 'rgba(142,196,224,0.06)', border: '1px solid rgba(142,196,224,0.15)', fontSize: '11px', color: '#D8E6F0', cursor: 'pointer' },
  chipDot: { width: '9px', height: '9px', borderRadius: '50%', flexShrink: 0 },
  emptyChip: { fontSize: '11px', color: '#8BAFC8', fontStyle: 'italic' },
  addBtn: { background: 'rgba(142,196,224,0.15)', border: '1px solid rgba(142,196,224,0.4)', borderRadius: '3px', padding: '10px 20px', color: '#8EC4E0', fontSize: '11px', fontWeight: '600', letterSpacing: '2px', textTransform: 'uppercase', cursor: 'pointer', whiteSpace: 'nowrap' },
  adoptBtn: { background: 'rgba(142,196,224,0.15)', border: '1px solid rgba(142,196,224,0.4)', borderRadius: '3px', padding: '8px 18px', color: '#8EC4E0', fontSize: '10px', fontWeight: '600', letterSpacing: '2px', textTransform: 'uppercase', cursor: 'pointer' },
  adoptedBtn: { background: 'none', border: '1px solid rgba(74,174,136,0.3)', borderRadius: '3px', padding: '8px 18px', color: '#4AAE88', fontSize: '10px', fontWeight: '600', letterSpacing: '2px', textTransform: 'uppercase', cursor: 'pointer' },
  smallBtn: { background: 'none', border: '1px solid rgba(142,196,224,0.2)', borderRadius: '2px', padding: '4px 10px', color: '#8BAFC8', fontSize: '10px', cursor: 'pointer' },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 200, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', overflowY: 'auto', padding: '40px 20px' },
  modal: { background: '#162534', border: '1px solid rgba(142,196,224,0.3)', borderRadius: '4px', width: '100%', maxWidth: '560px', padding: '32px', boxShadow: '0 0 40px rgba(0,0,0,0.6)', margin: 'auto' },
  x: { background: 'none', border: 'none', color: '#8BAFC8', cursor: 'pointer', fontSize: '18px' },
  fieldLabel: { fontSize: '10px', fontWeight: '600', letterSpacing: '2px', textTransform: 'uppercase', color: '#8BAFC8', marginBottom: '8px' },
  miniLabel: { fontSize: '9px', fontWeight: '600', letterSpacing: '2px', textTransform: 'uppercase', color: '#8BAFC8', marginBottom: '6px' },
  input: { width: '100%', background: '#0f2236', border: '1px solid rgba(142,196,224,0.2)', borderRadius: '3px', padding: '10px 14px', color: '#D8E6F0', fontSize: '14px', outline: 'none', boxSizing: 'border-box' },
  itemsEmpty: { fontSize: '12px', color: '#8BAFC8', fontStyle: 'italic', padding: '12px 0' },
  itemBlock: { padding: '14px', border: '1px solid rgba(142,196,224,0.15)', borderRadius: '3px', background: 'rgba(142,196,224,0.02)', marginBottom: '12px' },
  removeItemBtn: { background: 'none', border: '1px solid rgba(176,90,90,0.3)', borderRadius: '2px', padding: '6px 10px', color: '#C87878', fontSize: '10px', cursor: 'pointer', whiteSpace: 'nowrap' },
  addItemBtn: { background: 'none', border: '1px dashed rgba(142,196,224,0.3)', borderRadius: '3px', padding: '10px', color: '#8EC4E0', fontSize: '11px', cursor: 'pointer', width: '100%', marginBottom: '8px' },
  modalFooter: { display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px', paddingTop: '16px', borderTop: '1px solid rgba(142,196,224,0.15)' },
  cancelBtn: { background: 'none', border: '1px solid rgba(142,196,224,0.2)', borderRadius: '3px', padding: '10px 20px', color: '#8BAFC8', fontSize: '11px', cursor: 'pointer' },
  confirmBtn: { background: 'rgba(142,196,224,0.15)', border: '1px solid rgba(142,196,224,0.4)', borderRadius: '3px', padding: '10px 24px', color: '#8EC4E0', fontSize: '11px', fontWeight: '600', letterSpacing: '2px', textTransform: 'uppercase' },
  infoTrigger: { display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(142,196,224,0.06)', border: '1px solid rgba(142,196,224,0.3)', borderRadius: '20px', padding: '7px 16px', color: '#8EC4E0', fontSize: '10px', fontWeight: '600', letterSpacing: '2px', textTransform: 'uppercase', cursor: 'pointer' },
  infoTriggerIcon: { width: '15px', height: '15px', borderRadius: '50%', border: '1px solid rgba(142,196,224,0.5)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: '10px', lineHeight: 1 },
};

export default Patterns;