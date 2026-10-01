import fs from 'fs';
import path from 'path';
import {
  User,
  Question,
  Rubric,
  CourseDocument,
  DocumentChunk,
  StudentAnswer,
  Evaluation,
  FeedbackData,
} from '@/src/types/index.ts';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

export interface DatabaseSchema {
  users: User[];
  questions: Question[];
  rubrics: Rubric[];
  courseDocuments: CourseDocument[];
  documentChunks: DocumentChunk[];
  studentAnswers: StudentAnswer[];
  evaluations: Evaluation[];
  feedbackList: FeedbackData[];
  auditLogs: { id: string; action: string; userId: string; timestamp: string; details: any }[];
}

// Initial Seed Data matching the user's screenshots and requirements
const INITIAL_USERS: User[] = [
  {
    id: 'usr-fac-1',
    name: 'Prof. Elena Vance',
    email: 'elena.vance@stanford.edu',
    role: 'faculty',
    title: 'CS Chair & Evaluator',
    department: 'Dept. of Computer Science & Engineering',
    avatarUrl: 'https://lh3.googleusercontent.com/aida/AEtjO1VwitBe-3mMutump2lTEGq4Eb2qoTFTarX9zGZxvOsK45C2QKCjutDOCs6RtbnGmjVs5Fss6DhxBj5R8ch0T-jxZZ8mwuOVyvvO4VHkLz4N_08wd6rBXgLxDZlOE7qPTLcolFruYskWz-ynoB6Rkeok1Tu59MxY7_piiLKFcrGC9Rj6HL7E4-T1pKy5Nl7th31CHT6V7Q3H_4pzcB2Q0IBdv_pE43YgzbrruMcyyTswxfARb7kCnxd_7To',
  },
  {
    id: 'usr-fac-2',
    name: 'Dr. Priya Sharma',
    email: 'priya.sharma@stanford.edu',
    role: 'faculty',
    title: 'Associate Professor, AI & Vision',
    department: 'Dept. of Computer Science & Engineering',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=256&q=80',
  },
  {
    id: 'usr-stu-1',
    name: 'Alex Chen',
    email: 'alex.chen@stanford.edu',
    role: 'student',
    title: 'Undergrad · AI Specialization',
    department: 'Computer Science',
    studentId: 'CS-2024-883',
    avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCdTw4MunwNqvV9FBxMGoTfVCgLz760JQDn4sbQpCAMeewe8Kep3cs3Hxgg5OUUszTmA3gpAZye9yp5dHexfgXUF_ZeY42ejcRkZvqSMHQ4QAd-ta0j9r_9jlmXyhHNEO2YUd3OE4guyOpk82CL64Lc7-k4Q-G4KlpB1cZmgJFe10zJMLfSk95UOVF16fr6bkOfEsQNZ4Q3Xgl3mcdKlc_vxZz6KLKbP6KC4ZUTtTAlLRycRtKohd9d',
  },
  {
    id: 'usr-stu-2',
    name: 'Harish Kumar',
    email: 'harish.kumar@stanford.edu',
    role: 'student',
    title: 'Graduate Student · AI Research',
    department: 'Computer Science',
    studentId: 'CS-2024-9102',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
  },
];

const INITIAL_QUESTIONS: Question[] = [
  {
    id: 'q-cs231n-04',
    courseCode: 'CS231n',
    courseName: 'Deep Learning for Computer Vision',
    targetExam: 'Midterm Exam 2024',
    qid: '#CS231N-MID-Q04-DESCR',
    prompt: 'Explain the working of a Convolutional Neural Network.',
    maxMarks: 10.0,
    modality: 'Long Descriptive',
    semanticPrecision: 'Strict Semantic (Cos-sim cutoff: 0.84 / Concept checks active)',
    knowledgeCorpus: 'Goodfellow Ch. 9 & CS231n Syllabus Benchmark Index: Rev 2024.1',
    status: 'active',
    createdAt: new Date().toISOString(),
    expectedAnswer: `A Convolutional Neural Network (CNN) is a deep learning architecture specially tailored for handling data with a grid topology, such as 2D images. Inspired by biological vision mechanisms discovered in animal visual cortices, CNNs achieve parameter efficiency through shared spatial kernels.\n\nThe core operation is convolution, where learnable filters slide across an input image with a specified stride, taking element-wise dot products to produce 2D activation maps or feature maps. The output dimension is O = floor((W - F + 2P)/S) + 1.\n\nNext, non-linear activation functions (most commonly ReLU, f(x) = max(0, x)) must be applied to introduce non-linearity and prevent multiple linear layers from collapsing into a single linear map.\n\nTo compress the spatial dimensionality, pooling layers (most commonly Max Pooling) downsample the feature representations, introducing translation invariance and reducing compute.\n\nFinally, the multidimensional tensor is flattened into a 1D feature vector and passed through Fully Connected (Dense) layers with Softmax activation for categorical probability estimation. CNNs are widely deployed in autonomous driving pipelines and radiology imaging diagnostics.`,
    keyConcepts: [
      'Grid-topology input (2D/3D matrices)',
      'Kernels / filters sliding window & stride',
      'Element-wise dot product and feature maps',
      'Non-linear activation function (ReLU)',
      'Hierarchical representations (edges -> textures -> parts)',
      'Subsampling & Max Pooling (downsampling & translation invariance)',
      'Flattening and Fully Connected (Dense) classification',
      'Softmax probability distribution',
      'Real-world vision applications (medical imaging, autonomous driving)',
    ],
    learningObjectives: [
      'Understand convolution mechanics and spatial equivariance',
      'Articulate why non-linear activation functions prevent linear collapse',
      'Explain spatial pooling downsampling and invariance properties',
      'Trace end-to-end tensor transformations from input to Softmax logits',
    ],
  },
  {
    id: 'q-cs224n-01',
    courseCode: 'CS224n',
    courseName: 'Natural Language Processing with Deep Learning',
    targetExam: 'Assignment 02 · Attention Mechanisms',
    qid: '#CS224N-ASN-Q01-DESCR',
    prompt: 'Explain the mathematical formulation and intuitive motivation of Scaled Dot-Product Attention in the Transformer architecture.',
    maxMarks: 10.0,
    modality: 'Long Descriptive',
    semanticPrecision: 'Strict Semantic',
    knowledgeCorpus: 'Vaswani et al. (2017) Attention Is All You Need',
    status: 'active',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    expectedAnswer: `Scaled Dot-Product Attention computes attention weights by taking the inner product of queries Q and keys K, scaled by sqrt(d_k) to prevent vanishing gradients in the Softmax function: Attention(Q, K, V) = softmax(QK^T / sqrt(d_k)) V.`,
    keyConcepts: [
      'Queries, Keys, and Values matrices',
      'Dot-product similarity metric',
      'Scaling factor 1/sqrt(d_k)',
      'Softmax normalization over key dimensions',
      'Weighted summation of value vectors',
      'Overcoming sequential bottleneck of RNNs',
    ],
  },
];

const INITIAL_RUBRICS: Rubric[] = [
  {
    id: 'rub-q-cs231n-04',
    questionId: 'q-cs231n-04',
    totalMarks: 10.0,
    isLocked: true,
    model: 'GPT-4o-Deterministic-v2 / Gemini-3.8-Flash',
    updatedAt: new Date().toISOString(),
    criteria: [
      {
        id: 'crit-1',
        order: 1,
        name: 'Definition & Core Axiom',
        description: 'Establishes input modality geometry (2D grid-topology) and fundamental foundational neural architecture.',
        weightPct: 10,
        maxMarks: 1.0,
        targetSemanticAnchors: ['Grid-topology input', 'bio-inspired visual cortex', 'shift/spatial invariance'],
        deductionRules: 'Award 0.5 for generic deep learning mention without 2D Euclidean grid or spatial locality specification.',
        scoringLadder: {
          full: { marks: 1.0, description: 'Complete definition specifying 2D grid topology and spatial locality.' },
          partial: { marks: 0.5, description: 'Generic deep learning definition without topology context.' },
          zero: { marks: 0.0, description: 'Erroneous or missing definition.' },
        },
      },
      {
        id: 'crit-2',
        order: 2,
        name: 'Convolutional Mechanism',
        description: 'Mathematical and procedural mechanics of kernel transformation over matrix fields.',
        weightPct: 20,
        maxMarks: 2.0,
        targetSemanticAnchors: ['Kernels / filters', 'sliding window & stride', 'element-wise dot product', 'feature maps'],
        deductionRules: 'Requires intuition of weight sharing and dot-product summation across depth channels.',
        scoringLadder: {
          full: { marks: 2.0, description: 'Clear description of kernel translation, dot products, and feature map creation.' },
          partial: { marks: 1.0, description: 'Mentions filters sliding but omits dot product or output activation map derivation.' },
          zero: { marks: 0.0, description: 'Incorrect or absent convolution description.' },
        },
      },
      {
        id: 'crit-3',
        order: 3,
        name: 'Hierarchical Feature Extraction & Non-Linearity',
        description: 'Progression of sensory representations through depth layers and non-linearities (ReLU).',
        weightPct: 20,
        maxMarks: 2.0,
        targetSemanticAnchors: ['Hierarchical representation', 'edges -> textures -> parts', 'non-linear activation (ReLU)'],
        deductionRules: 'Penalize -1.0 if student completely omits non-linear activation rationale or claims linearity.',
        scoringLadder: {
          full: { marks: 2.0, description: 'Articulates hierarchical feature synthesis and explicit role of ReLU activation.' },
          partial: { marks: 1.0, description: 'Describes hierarchy but omits non-linear activation (linear collapse).' },
          zero: { marks: 0.0, description: 'Fails to describe progressive representation.' },
        },
      },
      {
        id: 'crit-4',
        order: 4,
        name: 'Subsampling & Pooling',
        description: 'Spatial dimension contraction and invariance mechanics across receptive fields.',
        weightPct: 20,
        maxMarks: 2.0,
        targetSemanticAnchors: ['Downsampling', 'Max Pooling / Avg Pooling', 'translation invariance', 'parameter reduction'],
        deductionRules: 'Candidate must contrast computational complexity relief with retention of dominant features.',
        scoringLadder: {
          full: { marks: 2.0, description: 'Accurate explanation of sliding window pooling, translation invariance, and downsampling.' },
          partial: { marks: 1.0, description: 'Mentions shrinking size without explaining max operation or invariance.' },
          zero: { marks: 0.0, description: 'Incorrect pooling intuition.' },
        },
      },
      {
        id: 'crit-5',
        order: 5,
        name: 'Classification & Dense Layers',
        description: 'Mapping spatial tensors to categorical probability manifolds via Flattening and Softmax.',
        weightPct: 20,
        maxMarks: 2.0,
        targetSemanticAnchors: ['Flattening layer', 'Fully Connected (Dense)', 'Softmax activation', 'class probability distribution'],
        deductionRules: 'Expect mention of vector serialization before final dense projection.',
        scoringLadder: {
          full: { marks: 2.0, description: 'Clearly explains tensor flattening, dense projection, and Softmax probability calculation.' },
          partial: { marks: 1.0, description: 'Mentions dense layers but misses flattening or Softmax normalization.' },
          zero: { marks: 0.0, description: 'Missing classification stage explanation.' },
        },
      },
      {
        id: 'crit-6',
        order: 6,
        name: 'Pragmatic Vision Applications',
        description: 'Demonstration of contextualized real-world engineering deployment.',
        weightPct: 10,
        maxMarks: 1.0,
        targetSemanticAnchors: ['Medical imaging (MRI/CT)', 'object detection', 'autonomous driving'],
        deductionRules: 'At least 2 concrete industry-standard vision applications required for full point.',
        scoringLadder: {
          full: { marks: 1.0, description: 'Cites at least two concrete real-world deployments (e.g. radiology, autonomous driving).' },
          partial: { marks: 0.5, description: 'Mentions only a vague generic example (e.g. "recognizing pictures").' },
          zero: { marks: 0.0, description: 'No applications cited.' },
        },
      },
    ],
  },
];

const INITIAL_DOCUMENTS: CourseDocument[] = [
  {
    id: 'doc-cs231n-textbook',
    facultyId: 'usr-fac-1',
    title: 'Deep Learning Book - Chapter 9: Convolutional Networks',
    subject: 'Computer Science',
    topic: 'Computer Vision & Deep Learning',
    fileName: 'goodfellow_deeplearning_ch9_cnn.pdf',
    fileType: 'application/pdf',
    fileSize: 2458000,
    uploadedAt: new Date(Date.now() - 172800000).toISOString(),
    chunksCount: 14,
    content: `Chapter 9: Convolutional Networks. Convolutional neural networks (CNNs) are a specialized kind of neural network for processing data that has a known, grid-like topology. Examples include time-series data (1D grid) and image data (2D grid of pixels).
Convolution leverages three important ideas: sparse interactions, parameter sharing, and equivariant representations.
In traditional neural networks, matrix multiplication involves every output unit interacting with every input unit. In a CNN, kernels are much smaller than the input image, so connections are sparse.
Parameter sharing means the same kernel is used at every position of the input. This drastically reduces memory requirements.
Equivariance to translation: if we translate the input image, the representation changes in the same way.
Pooling functions replace the output of the net at a certain location with a summary statistic of the nearby outputs, for example Max Pooling. Max pooling reports the maximum output within a rectangular neighborhood.
Non-linear activation functions such as the Rectified Linear Unit (ReLU: f(x) = max(0, x)) are essential between linear convolution stages to prevent recursive linear transformations from collapsing into a single linear map.
The output spatial dimension of a convolution stage is O = floor((W - F + 2P)/S) + 1.`,
  },
  {
    id: 'doc-cs231n-slides',
    facultyId: 'usr-fac-1',
    title: 'Stanford CS231n Lecture 5: Convolutional Neural Networks',
    subject: 'Computer Vision',
    topic: 'CNN Architecture & Mathematical Foundations',
    fileName: 'cs231n_lecture05_convolutional_neural_networks.pdf',
    fileType: 'application/pdf',
    fileSize: 3892000,
    uploadedAt: new Date(Date.now() - 86400000).toISOString(),
    chunksCount: 10,
    content: `CS231n Lecture 5: Convolutional Neural Networks.
Input: 32x32x3 image.
Filters: 5x5x3 filter slides over spatial locations with stride S. Dot product between filter and input chunk plus bias.
Activation Maps: Stack of 2D slices.
Conv Layer preserves spatial structure.
ReLU layer applies elementwise activation max(0,x).
Pooling Layer makes the representations smaller and more manageable, operates over each activation map independently.
Common settings for pooling: 2x2 max pooling with stride 2.
Fully Connected Layer takes all activations and computes class scores. Output dimension is 1xK where K is number of classes.`,
  },
];

const INITIAL_CHUNKS: DocumentChunk[] = [
  {
    id: 'chunk-1',
    documentId: 'doc-cs231n-textbook',
    documentTitle: 'Deep Learning Book - Chapter 9: Convolutional Networks',
    chunkIndex: 0,
    content: 'Convolutional neural networks (CNNs) are a specialized kind of neural network for processing data that has a known, grid-like topology, such as 2D pixel matrices. Key principles: sparse interactions, parameter sharing, and equivariant representations.',
    keywords: ['CNN', 'grid-like topology', 'sparse interactions', 'parameter sharing', 'equivariance'],
  },
  {
    id: 'chunk-2',
    documentId: 'doc-cs231n-textbook',
    documentTitle: 'Deep Learning Book - Chapter 9: Convolutional Networks',
    chunkIndex: 1,
    content: 'Convolution sliding window and dot product: small kernel matrix computes affine linear transforms. Formula for output size after stride S and padding P: O = floor((W - F + 2P)/S) + 1.',
    keywords: ['kernel', 'stride', 'padding', 'formula', 'output size'],
  },
  {
    id: 'chunk-3',
    documentId: 'doc-cs231n-textbook',
    documentTitle: 'Deep Learning Book - Chapter 9: Convolutional Networks',
    chunkIndex: 2,
    content: 'Detector stage and non-linearity: Rectified Linear Unit (ReLU: f(x) = max(0,x)) must follow convolution to avoid cascading linear transformations collapsing into a single linear map.',
    keywords: ['ReLU', 'activation function', 'non-linearity', 'linear collapse'],
  },
  {
    id: 'chunk-4',
    documentId: 'doc-cs231n-textbook',
    documentTitle: 'Deep Learning Book - Chapter 9: Convolutional Networks',
    chunkIndex: 3,
    content: 'Max pooling replaces outputs with maximum in local window. Imparts translation invariance, reduces memory and spatial complexity.',
    keywords: ['max pooling', 'subsampling', 'translation invariance', 'downsampling'],
  },
  {
    id: 'chunk-5',
    documentId: 'doc-cs231n-slides',
    documentTitle: 'Stanford CS231n Lecture 5: Convolutional Neural Networks',
    chunkIndex: 4,
    content: 'Classification stage: Flatten multidimensional tensor into 1D vector, pass through Fully Connected (Dense) layers, and apply Softmax activation for categorical probability distribution.',
    keywords: ['flattening', 'fully connected', 'dense layers', 'softmax', 'classification'],
  },
];

const INITIAL_ANSWERS: StudentAnswer[] = [
  {
    id: 'ans-alex-cs231n-04',
    studentId: 'usr-stu-1',
    studentName: 'Alex Chen',
    studentEmail: 'alex.chen@stanford.edu',
    studentUid: 'CS-2024-883',
    studentAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCdTw4MunwNqvV9FBxMGoTfVCgLz760JQDn4sbQpCAMeewe8Kep3cs3Hxgg5OUUszTmA3gpAZye9yp5dHexfgXUF_ZeY42ejcRkZvqSMHQ4QAd-ta0j9r_9jlmXyhHNEO2YUd3OE4guyOpk82CL64Lc7-k4Q-G4KlpB1cZmgJFe10zJMLfSk95UOVF16fr6bkOfEsQNZ4Q3Xgl3mcdKlc_vxZz6KLKbP6KC4ZUTtTAlLRycRtKohd9d',
    questionId: 'q-cs231n-04',
    wordCount: 412,
    status: 'FEEDBACK_AVAILABLE',
    submittedAt: new Date(Date.now() - 7200000).toISOString(),
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 7200000).toISOString(),
    submissionMethod: 'HANDWRITTEN_OCR',
    ocrStatus: 'CONFIRMED',
    ocrConfidence: 99.4,
    hasOcrUnclear: false,
    rawOcrText: `A Convolutional Neural Network (CNN) is a deep learning architecture primarily utilized for image recognition and computer vision tasks. The network works by passing an input image through a series of specialized layers.\n\nFirst, the Convolution Layer applies learnable filters or kernels that slide (convolve) across the input matrix to perform element-wise multiplication and summation, generating feature maps that capture local spatial hierarchies such as edges and textures.\n\nNext, Feature Extraction occurs across multiple depths, transforming basic pixel data into high-level representations like shapes and object parts.\n\nTo reduce the spatial dimensions and computational load, Pooling Layers (most commonly Max Pooling) are applied, taking the maximum value over a sliding window. This introduces translation invariance and downsamples the feature maps while retaining dominant features.\n\nFinally, the flattened feature maps are fed into Fully Connected (Dense) Layers for Classification, computing class probability scores using a Softmax activation function.\n\nCNNs are widely deployed in applications such as automated medical imaging diagnosis and autonomous vehicle perception.`,
    correctedOcrText: `A Convolutional Neural Network (CNN) is a deep learning architecture primarily utilized for image recognition and computer vision tasks. The network works by passing an input image through a series of specialized layers.\n\nFirst, the Convolution Layer applies learnable filters or kernels that slide (convolve) across the input matrix to perform element-wise multiplication and summation, generating feature maps that capture local spatial hierarchies such as edges and textures.\n\nNext, Feature Extraction occurs across multiple depths, transforming basic pixel data into high-level representations like shapes and object parts.\n\nTo reduce the spatial dimensions and computational load, Pooling Layers (most commonly Max Pooling) are applied, taking the maximum value over a sliding window. This introduces translation invariance and downsamples the feature maps while retaining dominant features.\n\nFinally, the flattened feature maps are fed into Fully Connected (Dense) Layers for Classification, computing class probability scores using a Softmax activation function.\n\nCNNs are widely deployed in applications such as automated medical imaging diagnosis and autonomous vehicle perception.`,
    handwrittenPages: [
      {
        pageNumber: 1,
        imageName: 'Alex_Chen_Handwritten_Scan_P1.png',
        imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBw5GnA8lSLNSyHQHF72aogkSxTUpco3GlR2XvzeypWX3pzDWAdZ8q1FztWCr6W16uk5DbG7quEEzjSxDbD9O1VAshTF5zflQlWY8GQF08MbNBzS6mSLVBin0jXLiyhL2zrYk5bbexD_AQJA2-8e93D0LPdUU-Qrt32m06-geH1ZO6V_Cgkn6M2N0cq_Qv0UgsEMhYq7VFJQ24m5Gb6UIV95v4euwO04kBkoW3TU6YW45bvLgFi0oSP',
        ocrConfidence: 99.6,
        hasUnclear: false,
      },
      {
        pageNumber: 2,
        imageName: 'Alex_Chen_Handwritten_Scan_P2.png',
        imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAyucroTvFel_hO8V4JWsR4pwnCSgHSdC-Y3C-1LcJ_Jw2eoZI5E1zdE13-zC6y1v6NmY6rW3UfRN7G3WSp6JZAUHUb7k1ObImiPbgBHwG8IZx9wymFw7ZpPUCrwCgP2WkQUrN6NIQ5Scoji7HzgUJdTbIOdlSAim5SMzBdRjwYuUkyRuVteTOboP_qKUVmUlwRDlpuZPrPLXy4tK-Hs1th0Hn-fmj1FowxOBo8r0L5QuFcsbWDF5w5',
        ocrConfidence: 99.2,
        hasUnclear: false,
      },
      {
        pageNumber: 3,
        imageName: 'Alex_Chen_Handwritten_Scan_P3.png',
        imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAmKxpAe5yJ5JDsAJcq6_wPRBzsIbQSsR7_WU4mwoslCrrspck7ASfbMzXSYpg6tR77VNOssfRrqK2_-yf8hw2tqETkcZOlvfVKuZ_EYzyfVWtjIRkjTVJ38O_r1zkJyPkDzUxo7g6d0DLsYyGTT18Z9t5KAKblbp-JKgOxDlR2sEJfHZnL4POOnBGAGC7AMHctMR8C31BNi2TvdKNXCLuMWrNJsKJiSPjea8yaGw6yvzGK70vQxm7y',
        ocrConfidence: 99.4,
        hasUnclear: false,
      },
    ],
    answerText: `A Convolutional Neural Network (CNN) is a deep learning architecture primarily utilized for image recognition and computer vision tasks. The network works by passing an input image through a series of specialized layers.

First, the Convolution Layer applies learnable filters or kernels that slide (convolve) across the input matrix to perform element-wise multiplication and summation, generating feature maps that capture local spatial hierarchies such as edges and textures.

Next, Feature Extraction occurs across multiple depths, transforming basic pixel data into high-level representations like shapes and object parts.

To reduce the spatial dimensions and computational load, Pooling Layers (most commonly Max Pooling) are applied, taking the maximum value over a sliding window. This introduces translation invariance and downsamples the feature maps while retaining dominant features.

Finally, the flattened feature maps are fed into Fully Connected (Dense) Layers for Classification, computing class probability scores using a Softmax activation function.

CNNs are widely deployed in applications such as automated medical imaging diagnosis and autonomous vehicle perception.`,
    attachments: [
      {
        name: 'CNN_Layer_Pipeline.png',
        type: 'image/png',
        url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBw5GnA8lSLNSyHQHF72aogkSxTUpco3GlR2XvzeypWX3pzDWAdZ8q1FztWCr6W16uk5DbG7quEEzjSxDbD9O1VAshTF5zflQlWY8GQF08MbNBzS6mSLVBin0jXLiyhL2zrYk5bbexD_AQJA2-8e93D0LPdUU-Qrt32m06-geH1ZO6V_Cgkn6M2N0cq_Qv0UgsEMhYq7VFJQ24m5Gb6UIV95v4euwO04kBkoW3TU6YW45bvLgFi0oSP',
      },
      {
        name: 'Convolution_Matrix.png',
        type: 'image/png',
        url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAyucroTvFel_hO8V4JWsR4pwnCSgHSdC-Y3C-1LcJ_Jw2eoZI5E1zdE13-zC6y1v6NmY6rW3UfRN7G3WSp6JZAUHUb7k1ObImiPbgBHwG8IZx9wymFw7ZpPUCrwCgP2WkQUrN6NIQ5Scoji7HzgUJdTbIOdlSAim5SMzBdRjwYuUkyRuVteTOboP_qKUVmUlwRDlpuZPrPLXy4tK-Hs1th0Hn-fmj1FowxOBo8r0L5QuFcsbWDF5w5',
      },
      {
        name: 'Pooling_Stride_2.png',
        type: 'image/png',
        url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAmKxpAe5yJ5JDsAJcq6_wPRBzsIbQSsR7_WU4mwoslCrrspck7ASfbMzXSYpg6tR77VNOssfRrqK2_-yf8hw2tqETkcZOlvfVKuZ_EYzyfVWtjIRkjTVJ38O_r1zkJyPkDzUxo7g6d0DLsYyGTT18Z9t5KAKblbp-JKgOxDlR2sEJfHZnL4POOnBGAGC7AMHctMR8C31BNi2TvdKNXCLuMWrNJsKJiSPjea8yaGw6yvzGK70vQxm7y',
      },
    ],
  },
  {
    id: 'ans-harish-cs231n-04',
    studentId: 'usr-stu-2',
    studentName: 'Harish Kumar',
    studentEmail: 'harish.kumar@stanford.edu',
    studentUid: 'CS-2024-9102',
    studentAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
    questionId: 'q-cs231n-04',
    wordCount: 185,
    status: 'SUBMITTED',
    submittedAt: new Date(Date.now() - 3600000).toISOString(),
    createdAt: new Date(Date.now() - 14400000).toISOString(),
    updatedAt: new Date(Date.now() - 3600000).toISOString(),
    answerText: `A convolutional neural network is a deep learning model mainly used for image processing. It contains convolution layers that extract features from images. Pooling reduces the size of feature maps. The extracted features are passed to fully connected layers for classification. For example, self-driving cars use this to see pedestrians.`,
    attachments: [],
  },
];

const INITIAL_EVALUATIONS: Evaluation[] = [
  {
    id: 'eval-alex-cs231n-04',
    answerId: 'ans-alex-cs231n-04',
    questionId: 'q-cs231n-04',
    studentId: 'usr-stu-1',
    aiRecommendedScore: 7.5,
    facultyFinalScore: 7.5,
    maxScore: 10.0,
    confidencePct: 94,
    lossDeviation: 0.15,
    status: 'APPROVED',
    reviewedBy: 'Prof. Elena Vance',
    reviewedAt: new Date().toISOString(),
    auditHash: '9f82d1..c4a7',
    evaluatedAt: new Date(Date.now() - 3600000).toISOString(),
    facultyNotes: 'Good understanding of filter mechanics and max pooling downsampling. Deduction of 1.0 point on Criterion 3 for failing to cite ReLU non-linear activation between linear stages, and 0.5 on Criterion 1 for omitting 2D grid-topology premise.',
    criteriaResults: [
      {
        criterionId: 'crit-1',
        criterionName: 'Definition & Topology',
        criterionOrder: 1,
        maxMarks: 1.0,
        awardedMarks: 0.5,
        status: 'PARTIAL',
        semSim: 0.68,
        evidence: 'deep learning architecture primarily utilized for image recognition and computer vision tasks.',
        rationale: 'Answer gives generic perception context. Missed key theoretical premise: structured 2D/3D Euclidean grid topologies and spatial equivariance foundation.',
        missingConcepts: ['2D grid-structured topology', 'spatial equivariance'],
      },
      {
        criterionId: 'crit-2',
        criterionName: 'Convolution & Kernel Sliding',
        criterionOrder: 2,
        maxMarks: 2.0,
        awardedMarks: 2.0,
        status: 'FULL',
        semSim: 0.96,
        evidence: 'Convolution Layer applies learnable filters or kernels that slide (convolve) across the input matrix to perform element-wise multiplication and summation, generating feature maps that capture local spatial hierarchies such as edges and textures.',
        rationale: 'Clear description of dot product accumulation, filter stride across input matrices, and feature map construction. All model answer benchmarks fulfilled.',
        missingConcepts: [],
      },
      {
        criterionId: 'crit-3',
        criterionName: 'Feature Hierarchies & Non-Linearity',
        criterionOrder: 3,
        maxMarks: 2.0,
        awardedMarks: 1.0,
        status: 'PARTIAL',
        semSim: 0.62,
        evidence: 'Feature Extraction occurs across multiple depths, transforming basic pixel data into high-level representations like shapes and object parts.',
        rationale: 'Student recognized multi-depth low-to-high feature progression, but completely omitted the mandatory non-linear activation layers (e.g., ReLU / rectified linear units) required to eliminate linearity between successive convolutions.',
        missingConcepts: ['Non-linear activation function (ReLU)', 'Elimination of linear collapse'],
        conceptualErrors: ['Linear Feature Extraction Fallacy: Implied that successive convolutions alone provide deep representational capacity without non-linear thresholding.'],
      },
      {
        criterionId: 'crit-4',
        criterionName: 'Pooling & Invariance',
        criterionOrder: 4,
        maxMarks: 2.0,
        awardedMarks: 2.0,
        status: 'FULL',
        semSim: 0.94,
        evidence: 'Pooling Layers (most commonly Max Pooling) are applied, taking the maximum value over a sliding window. This introduces translation invariance and downsamples the feature maps while retaining dominant features.',
        rationale: 'Explicitly explains Max-Pooling window downsampling, computational savings, and translation invariance retention.',
        missingConcepts: [],
      },
      {
        criterionId: 'crit-5',
        criterionName: 'Flattening, Dense Layers & Softmax',
        criterionOrder: 5,
        maxMarks: 2.0,
        awardedMarks: 2.0,
        status: 'FULL',
        semSim: 0.98,
        evidence: 'the flattened feature maps are fed into Fully Connected (Dense) Layers for Classification, computing class probability scores using a Softmax activation function.',
        rationale: 'Clearly identifies flattening, dense multi-dimensional matrix projection, and normalized probability distribution calculation via Softmax.',
        missingConcepts: [],
      },
      {
        criterionId: 'crit-6',
        criterionName: 'Empirical Applications',
        criterionOrder: 6,
        maxMarks: 1.0,
        awardedMarks: 1.0,
        status: 'FULL',
        semSim: 0.91,
        evidence: 'CNNs are widely deployed in applications such as automated medical imaging diagnosis and autonomous vehicle perception.',
        rationale: 'Two verified industry applications cited (radiology imaging and self-driving vision systems).',
        missingConcepts: [],
      },
    ],
  },
];

const INITIAL_FEEDBACK: FeedbackData[] = [
  {
    id: 'fb-alex-cs231n-04',
    evaluationId: 'eval-alex-cs231n-04',
    answerId: 'ans-alex-cs231n-04',
    studentId: 'usr-stu-1',
    finalScore: 7.5,
    maxScore: 10.0,
    letterGrade: 'B+',
    cohortRank: '68th %ile',
    certifiedBy: 'Prof. Elena Vance',
    certifiedDate: 'October 24, 2024 at 14:32 PST',
    auditHash: '9f82d1..c4a7 | ExplainGrade Engine v2.4 Compliant',
    pillars: {
      p1Mastered: {
        marks: 6.0,
        rubricCoverage: '4 / 4 Complete',
        strengths: [
          {
            title: 'Kernel Mechanics',
            detail: 'Clear description of 2D cross-correlation filter sliding across input channels with dot product calculation.',
          },
          {
            title: 'Spatial Downsampling',
            detail: 'Flawless articulation of Max Pooling, parameter reduction, and translation invariance utility.',
          },
          {
            title: 'Dense Mapping',
            detail: 'Correct breakdown of fully connected layers routing to Softmax probability distributions.',
          },
          {
            title: 'Contextual Application',
            detail: 'Effective medical image segmentation and autonomous driving use cases cited.',
          },
        ],
      },
      p2Deductions: {
        marksLost: 2.5,
        criteriaPenalized: 3,
        rootCauses: [
          {
            criterion: 'Criterion 3: Non-Linearity',
            marks: -1.0,
            explanation: 'Omitted ReLU activation after convolution. Without non-linearity, cascaded layers collapse mathematically into single linear filters.',
          },
          {
            criterion: 'Criterion 1: Inductive Bias',
            marks: -0.5,
            explanation: 'Did not mention 2D grid topology or spatial locality priors that distinguish CNNs from dense Multi-Layer Perceptrons.',
          },
          {
            criterion: 'Formalism: Dimensions',
            marks: -1.0,
            explanation: 'Failed to state arithmetic formula relating input, stride, and padding: O = floor((W - F + 2P)/S) + 1.',
          },
        ],
      },
      p3Cognition: {
        alertCount: 1,
        misconceptions: [
          {
            title: 'Linear Feature Extraction Fallacy',
            detectedMisconception: 'Your answer implied that deep feature maps emerge solely through recursive convolving operations. In reality, deep representational capacity is entirely contingent on introducing point-wise non-linearities (like ReLU / GELU) between spatial stages.',
            remediationAnchor: 'Deep Learning Book Ch 9.2: Activation Functions in CNNs',
            severity: 'Moderate',
          },
        ],
      },
      p4Exemplar: {
        benchmarkScore: 10.0,
        criteriaSummary: 'Includes algebraic proof of dimension shrinkage, non-saturating gradients, and inductive bias over dense connections.',
        diffScore: '84% Lexical Match',
        missingTokens: '2 Mathematical Tokens (ReLU non-linear equation, spatial dimension formula)',
      },
    },
    studentAnswerFormatted: {
      paragraphs: [
        {
          text: 'A Convolutional Neural Network (CNN) is a deep learning architecture primarily utilized for image recognition and computer vision tasks. The network works by passing an input image through a series of specialized layers.',
          highlight: {
            text: 'deep learning architecture primarily utilized for image recognition and computer vision tasks.',
            type: 'partial',
            criterionOrder: 1,
            criterionName: 'Criterion 1: Formal CNN Definition',
            marksAwarded: 0.5,
            maxMarks: 1.0,
            semSim: 0.68,
            diagnostic: 'Generic high-level description provided. Lacks explicit specification of grid-structured topology (2D pixel matrices) and shift/spatial equivariance foundation.',
          },
        },
        {
          text: 'First, the Convolution Layer applies learnable filters or kernels that slide (convolve) across the input matrix to perform element-wise multiplication and summation, generating feature maps that capture local spatial hierarchies such as edges and textures.',
          highlight: {
            text: 'Convolution Layer applies learnable filters or kernels that slide (convolve) across the input matrix to perform element-wise multiplication and summation, generating feature maps that capture local spatial hierarchies such as edges and textures.',
            type: 'full',
            criterionOrder: 2,
            criterionName: 'Criterion 2: Convolutional Mechanics',
            marksAwarded: 2.0,
            maxMarks: 2.0,
            semSim: 0.96,
            diagnostic: 'Rigorous explanation of kernel translation, dot product operations, and resulting feature map spatial hierarchies. All model answer benchmarks fulfilled.',
          },
        },
        {
          text: 'Next, Feature Extraction occurs across multiple depths, transforming basic pixel data into high-level representations like shapes and object parts.',
          highlight: {
            text: 'Feature Extraction occurs across multiple depths, transforming basic pixel data into high-level representations like shapes and object parts.',
            type: 'partial',
            criterionOrder: 3,
            criterionName: 'Criterion 3: Hierarchical Representations',
            marksAwarded: 1.0,
            maxMarks: 2.0,
            semSim: 0.62,
            diagnostic: 'Student recognized multi-depth low-to-high feature progression, but completely omitted the mandatory non-linear activation layers (e.g., ReLU / rectified linear units) required to eliminate linearity between successive convolutions.',
          },
        },
        {
          text: 'To reduce the spatial dimensions and computational load, Pooling Layers (most commonly Max Pooling) are applied, taking the maximum value over a sliding window. This introduces translation invariance and downsamples the feature maps while retaining dominant features.',
          highlight: {
            text: 'Pooling Layers (most commonly Max Pooling) are applied, taking the maximum value over a sliding window. This introduces translation invariance and downsamples the feature maps while retaining dominant features.',
            type: 'full',
            criterionOrder: 4,
            criterionName: 'Criterion 4: Subsampling & Invariance',
            marksAwarded: 2.0,
            maxMarks: 2.0,
            semSim: 0.94,
            diagnostic: 'Exact technical grounding of max pooling windowing, parameter reduction, downsampling, and spatial translation invariance.',
          },
        },
        {
          text: 'Finally, the flattened feature maps are fed into Fully Connected (Dense) Layers for Classification, computing class probability scores using a Softmax activation function.',
          highlight: {
            text: 'the flattened feature maps are fed into Fully Connected (Dense) Layers for Classification, computing class probability scores using a Softmax activation function.',
            type: 'full',
            criterionOrder: 5,
            criterionName: 'Criterion 5: Final Classification Stage',
            marksAwarded: 2.0,
            maxMarks: 2.0,
            semSim: 0.98,
            diagnostic: 'Clearly identifies flattening, dense multi-dimensional matrix projection, and normalized probability distribution calculation via Softmax.',
          },
        },
        {
          text: 'CNNs are widely deployed in applications such as automated medical imaging diagnosis and autonomous vehicle perception.',
          highlight: {
            text: 'CNNs are widely deployed in applications such as automated medical imaging diagnosis and autonomous vehicle perception.',
            type: 'full',
            criterionOrder: 6,
            criterionName: 'Criterion 6: Real-World Applications',
            marksAwarded: 1.0,
            maxMarks: 1.0,
            semSim: 0.91,
            diagnostic: 'Two verified industry applications cited (radiology imaging and self-driving vision systems).',
          },
        },
      ],
    },
    modelAnswer: `[Inductive Bias] Convolutional Neural Networks (CNNs) are architectures explicitly parameterized for data that has a known, grid-like topology (e.g., 2D arrays of pixels). They leverage spatial locality and equivariant representations.

1. Convolution Stage: Kernels of size K x K compute affine linear transforms over receptive fields. The spatial output dimensions are governed by:
O = floor((W - F + 2P) / S) + 1
where W is input dimension, F is kernel size, P is zero-padding, and S is stride.

2. Detector Stage (Crucial Inclusion: Non-Linear Activation ReLU): The linear output is immediately fed into an element-wise non-linear activation, standardly the Rectified Linear Unit: f(x) = max(0, x). Without this step, stacking multiple convolution layers mathematically collapses into a trivial single linear transform, preventing the modeling of complex decision boundaries.

3. Pooling Stage: Replaces the network output at specific locations with summary statistics (Max Pooling). This induces translation equivariance and invariance while halving spatial dimensions.

4. Dense Classification: Flattened latent representations are routed through fully connected layers with Softmax normalization, mapping learned high-level abstractions to class likelihood vectors.`,
    whyLostMarks: [
      {
        concept: 'Non-Linear Activation Functions (ReLU)',
        deduction: 1.0,
        studentAnswerSnippet: 'Feature Extraction occurs across multiple depths, transforming basic pixel data into high-level representations...',
        expectedConcept: 'The linear output of convolution must be passed into an element-wise non-linear activation function, standardly the Rectified Linear Unit: f(x) = max(0, x).',
        why: 'You progressed directly from convolutional filtering to max pooling without applying a non-linear activation threshold (e.g., ReLU). Stacking linear convolutions without non-linearity mathematically collapses into a single linear filter.',
        howToImprove: 'Explicitly mention the Detector Stage and state the formula f(x) = max(0, x). Explain that non-linear activation enables the network to learn non-linear decision boundaries.',
      },
      {
        concept: '2D Grid Topology Prior & Inductive Bias',
        deduction: 0.5,
        studentAnswerSnippet: '...deep learning architecture primarily utilized for image recognition and computer vision tasks.',
        expectedConcept: 'CNNs are architectures explicitly structured for inputs with grid-like spatial topology (e.g., 2D arrays of pixels with local correlation).',
        why: 'The answer gave a generic definition without articulating the fundamental geometric prior (2D grid topology and spatial locality) that distinguishes CNNs from Multilayer Perceptrons.',
        howToImprove: 'Define CNNs by their structural inductive bias: processing data with grid topology using weight sharing, local receptive fields, and translational equivariance.',
      },
      {
        concept: 'Spatial Output Dimension Formula',
        deduction: 1.0,
        studentAnswerSnippet: '...filters or kernels that slide (convolve) across the input matrix to perform element-wise multiplication...',
        expectedConcept: 'Output spatial dimension is given by: O = floor((W - F + 2P)/S) + 1, where W is input size, F is kernel size, P is padding, and S is stride.',
        why: 'Lacked mathematical formalization for computing receptive field shrinkage and output feature map geometry.',
        howToImprove: 'State the spatial dimension equation with clear definitions for input width W, filter size F, padding P, and stride S.',
      },
    ],
    improvementSuggestions: [
      'Study Deep Learning Book (Goodfellow) Chapter 9.2: Activation Functions in CNNs to solidify the mathematical rationale of non-linear activations.',
      'Practice deriving the output dimension formula O = floor((W - F + 2P)/S) + 1 for various stride and padding values.',
      'Clearly distinguish between translation equivariance (in convolution layers) and translation invariance (induced by pooling layers).',
      'Use the Interactive Remediation Sandbox to re-write your missing section and verify 100% rubric compliance.',
    ],
  },
];

class Database {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.load();
  }

  private load(): DatabaseSchema {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        return JSON.parse(raw);
      }
    } catch (e) {
      console.warn('Could not read existing db.json, initializing fresh data', e);
    }

    const initialData: DatabaseSchema = {
      users: INITIAL_USERS,
      questions: INITIAL_QUESTIONS,
      rubrics: INITIAL_RUBRICS,
      courseDocuments: INITIAL_DOCUMENTS,
      documentChunks: INITIAL_CHUNKS,
      studentAnswers: INITIAL_ANSWERS,
      evaluations: INITIAL_EVALUATIONS,
      feedbackList: INITIAL_FEEDBACK,
      auditLogs: [],
    };

    this.persist(initialData);
    return initialData;
  }

  private persist(dataToSave?: DatabaseSchema) {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(dataToSave || this.data, null, 2), 'utf-8');
    } catch (e) {
      console.error('Failed to write db.json:', e);
    }
  }

  // Users
  getUsers(): User[] {
    return this.data.users;
  }

  getUserById(id: string): User | undefined {
    return this.data.users.find((u) => u.id === id);
  }

  getUserByEmail(email: string): User | undefined {
    return this.data.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  // Questions
  getQuestions(): Question[] {
    return this.data.questions.map((q) => {
      const rubric = this.data.rubrics.find((r) => r.questionId === q.id);
      return { ...q, rubric };
    });
  }

  getQuestionById(id: string): Question | undefined {
    const q = this.data.questions.find((item) => item.id === id);
    if (!q) return undefined;
    const rubric = this.data.rubrics.find((r) => r.questionId === q.id);
    return { ...q, rubric };
  }

  saveQuestion(question: Question): Question {
    const idx = this.data.questions.findIndex((q) => q.id === question.id);
    if (idx >= 0) {
      this.data.questions[idx] = question;
    } else {
      this.data.questions.unshift(question);
    }
    this.persist();
    return question;
  }

  deleteQuestion(id: string): boolean {
    const initialLen = this.data.questions.length;
    this.data.questions = this.data.questions.filter((q) => q.id !== id);
    this.data.rubrics = this.data.rubrics.filter((r) => r.questionId !== id);
    this.persist();
    return this.data.questions.length < initialLen;
  }

  // Rubrics
  getRubrics(): Rubric[] {
    return this.data.rubrics;
  }

  getRubricByQuestionId(questionId: string): Rubric | undefined {
    return this.data.rubrics.find((r) => r.questionId === questionId);
  }

  saveRubric(rubric: Rubric): Rubric {
    const idx = this.data.rubrics.findIndex((r) => r.id === rubric.id || r.questionId === rubric.questionId);
    if (idx >= 0) {
      this.data.rubrics[idx] = rubric;
    } else {
      this.data.rubrics.push(rubric);
    }
    this.persist();
    return rubric;
  }

  // Documents & RAG chunks
  getDocuments(): CourseDocument[] {
    return this.data.courseDocuments;
  }

  saveDocument(doc: CourseDocument, chunks: DocumentChunk[]): CourseDocument {
    this.data.courseDocuments.unshift(doc);
    this.data.documentChunks.push(...chunks);
    this.persist();
    return doc;
  }

  deleteDocument(id: string): boolean {
    const initialLen = this.data.courseDocuments.length;
    this.data.courseDocuments = this.data.courseDocuments.filter((d) => d.id !== id);
    this.data.documentChunks = this.data.documentChunks.filter((c) => c.documentId !== id);
    this.persist();
    return this.data.courseDocuments.length < initialLen;
  }

  getChunks(): DocumentChunk[] {
    return this.data.documentChunks;
  }

  // Student Answers
  getAnswers(): StudentAnswer[] {
    return this.data.studentAnswers;
  }

  getAnswerById(id: string): StudentAnswer | undefined {
    return this.data.studentAnswers.find((a) => a.id === id);
  }

  getAnswersByStudent(studentId: string): StudentAnswer[] {
    return this.data.studentAnswers.filter((a) => a.studentId === studentId);
  }

  saveAnswer(answer: StudentAnswer): StudentAnswer {
    const idx = this.data.studentAnswers.findIndex((a) => a.id === answer.id);
    if (idx >= 0) {
      this.data.studentAnswers[idx] = answer;
    } else {
      this.data.studentAnswers.unshift(answer);
    }
    this.persist();
    return answer;
  }

  deleteAnswer(id: string): boolean {
    const prevLen = this.data.studentAnswers.length;
    this.data.studentAnswers = this.data.studentAnswers.filter((a) => a.id !== id);
    this.data.evaluations = this.data.evaluations.filter((e) => e.answerId !== id);
    this.data.feedbackList = this.data.feedbackList.filter((f) => f.answerId !== id);
    this.persist();
    return this.data.studentAnswers.length < prevLen;
  }

  deleteAnswersByStudentAndQuestion(studentId: string, questionId: string): void {
    const removedAnswers = this.data.studentAnswers.filter(
      (a) => a.studentId === studentId && a.questionId === questionId
    );
    const removedIds = new Set(removedAnswers.map((a) => a.id));
    this.data.studentAnswers = this.data.studentAnswers.filter((a) => !removedIds.has(a.id));
    this.data.evaluations = this.data.evaluations.filter((e) => !removedIds.has(e.answerId));
    this.data.feedbackList = this.data.feedbackList.filter((f) => !removedIds.has(f.answerId));
    this.persist();
  }

  // Evaluations
  getEvaluations(): Evaluation[] {
    return this.data.evaluations;
  }

  getEvaluationById(id: string): Evaluation | undefined {
    return this.data.evaluations.find((e) => e.id === id);
  }

  getEvaluationByAnswerId(answerId: string): Evaluation | undefined {
    return this.data.evaluations.find((e) => e.answerId === answerId);
  }

  saveEvaluation(evaluation: Evaluation): Evaluation {
    const idx = this.data.evaluations.findIndex((e) => e.id === evaluation.id || e.answerId === evaluation.answerId);
    if (idx >= 0) {
      this.data.evaluations[idx] = evaluation;
    } else {
      this.data.evaluations.unshift(evaluation);
    }
    this.persist();
    return evaluation;
  }

  // Feedback
  getFeedbackByAnswerId(answerId: string): FeedbackData | undefined {
    return this.data.feedbackList.find((f) => f.answerId === answerId);
  }

  saveFeedback(feedback: FeedbackData): FeedbackData {
    const idx = this.data.feedbackList.findIndex((f) => f.id === feedback.id || f.answerId === feedback.answerId);
    if (idx >= 0) {
      this.data.feedbackList[idx] = feedback;
    } else {
      this.data.feedbackList.unshift(feedback);
    }
    this.persist();
    return feedback;
  }

  // Reset to initial demo state
  resetDemo(): void {
    this.data = {
      users: INITIAL_USERS,
      questions: INITIAL_QUESTIONS,
      rubrics: INITIAL_RUBRICS,
      courseDocuments: INITIAL_DOCUMENTS,
      documentChunks: INITIAL_CHUNKS,
      studentAnswers: INITIAL_ANSWERS,
      evaluations: INITIAL_EVALUATIONS,
      feedbackList: INITIAL_FEEDBACK,
      auditLogs: [],
    };
    this.persist();
  }
}

export const db = new Database();
