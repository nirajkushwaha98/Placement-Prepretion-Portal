from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from apps.accounts.models import StudentProfile, AdminProfile
from apps.aptitude.models import AptitudeCategory, AptitudeQuestion, AptitudeTest
from apps.coding.models import CodingProblem
from apps.interview.models import InterviewCategory, InterviewQuestion

User = get_user_model()

class Command(BaseCommand):
    help = 'Seeds initial realistic data for Placement Preparation Portal'

    def handle(self, *args, **kwargs):
        self.stdout.write(self.style.NOTICE("Seeding data..."))

        # 1. Seed Users
        # Admin
        admin_user, created = User.objects.get_or_create(
            email='admin@placement.com',
            defaults={
                'username': 'admin',
                'first_name': 'Dr. Alok',
                'last_name': 'Sharma',
                'role': 'ADMIN',
                'is_staff': True,
                'is_superuser': True,
                'phone': '+91 9876543210'
            }
        )
        if created:
            admin_user.set_password('Admin@123456')
            admin_user.save()
            AdminProfile.objects.create(
                user=admin_user,
                department='Training & Placement Cell',
                designation='Head of Placement & Corporate Relations'
            )
            self.stdout.write(self.style.SUCCESS("Created admin: admin@placement.com"))

        # Student
        student_user, created = User.objects.get_or_create(
            email='student@placement.com',
            defaults={
                'username': 'student',
                'first_name': 'Rahul',
                'last_name': 'Verma',
                'role': 'STUDENT',
                'phone': '+91 9123456780'
            }
        )
        if created:
            student_user.set_password('Student@123456')
            student_user.save()
            StudentProfile.objects.create(
                user=student_user,
                college='Apex Institute of Engineering & Technology',
                degree='B.Tech',
                branch='Computer Science & Engineering',
                graduation_year=2026,
                skills=['Python', 'Django', 'React', 'JavaScript', 'SQL', 'Git', 'Data Structures', 'REST APIs', 'Docker', 'PostgreSQL'],
                github_url='https://github.com/student-demo',
                linkedin_url='https://linkedin.com/in/student-demo',
                bio='Final-year Computer Science undergraduate passionate about full-stack engineering and distributed systems.'
            )
            self.stdout.write(self.style.SUCCESS("Created student: student@placement.com"))

        # 2. Seed Aptitude Categories & Questions
        categories_data = [
            {
                'name': 'Quantitative Aptitude',
                'slug': 'quantitative-aptitude',
                'description': 'Arithmetic, algebra, percentages, speed distance, time work, and numerical reasoning.',
                'icon': 'Calculator',
                'order': 1
            },
            {
                'name': 'Logical Reasoning',
                'slug': 'logical-reasoning',
                'description': 'Deductive reasoning, series, seating arrangements, blood relations, and puzzles.',
                'icon': 'Brain',
                'order': 2
            },
            {
                'name': 'Verbal Ability',
                'slug': 'verbal-ability',
                'description': 'Grammar, vocabulary, reading comprehension, para jumbles, and sentence completion.',
                'icon': 'BookOpen',
                'order': 3
            },
            {
                'name': 'Data Interpretation',
                'slug': 'data-interpretation',
                'description': 'Tables, bar charts, pie charts, and multi-variable analytical interpretation.',
                'icon': 'BarChart3',
                'order': 4
            },
        ]

        cat_objs = {}
        for cat in categories_data:
            obj, _ = AptitudeCategory.objects.get_or_create(
                slug=cat['slug'],
                defaults=cat
            )
            cat_objs[cat['slug']] = obj

        # 30 Curated Aptitude Questions
        aptitude_questions = [
            # Quantitative
            {
                'cat': 'quantitative-aptitude',
                'topic': 'Percentages',
                'text': 'If the price of a book is first increased by 20% and then decreased by 20%, what is the net change in price?',
                'options': ['4% increase', '4% decrease', 'No change', '2% decrease'],
                'correct': 1,
                'difficulty': 'EASY',
                'explanation': 'Net percentage change formula = a + b + (ab/100) = +20 - 20 - (400/100) = -4%. Therefore, price decreases by 4%.'
            },
            {
                'cat': 'quantitative-aptitude',
                'topic': 'Profit and Loss',
                'text': 'A trader sells an article for $480 incurring a loss of 20%. At what price should he sell it to gain 20%?',
                'options': ['$600', '$720', '$680', '$750'],
                'correct': 1,
                'difficulty': 'MEDIUM',
                'explanation': 'Cost Price (CP) = 480 / (1 - 0.20) = 480 / 0.8 = $600. To gain 20%, Selling Price (SP) = 600 * 1.20 = $720.'
            },
            {
                'cat': 'quantitative-aptitude',
                'topic': 'Time and Work',
                'text': 'Pipe A can fill a tank in 12 hours and Pipe B can fill it in 18 hours. If both pipes are opened together, how long will it take to fill the tank?',
                'options': ['7.2 hours', '6 hours', '8.5 hours', '7.5 hours'],
                'correct': 0,
                'difficulty': 'EASY',
                'explanation': 'Rate of A = 1/12, Rate of B = 1/18. Combined rate = (3+2)/36 = 5/36. Time = 36/5 = 7.2 hours.'
            },
            {
                'cat': 'quantitative-aptitude',
                'topic': 'Time and Work',
                'text': 'A and B can do a piece of work in 10 and 15 days respectively. They began the work together but A left after 2 days. In how many more days will B finish the remaining work?',
                'options': ['10 days', '12 days', '11 days', '8 days'],
                'correct': 0,
                'difficulty': 'MEDIUM',
                'explanation': '1 day work of (A+B) = 1/10 + 1/15 = 1/6. In 2 days, work done = 2/6 = 1/3. Remaining work = 2/3. Time for B = (2/3) / (1/15) = 10 days.'
            },
            {
                'cat': 'quantitative-aptitude',
                'topic': 'Speed and Distance',
                'text': 'A train 150 meters long passes a telegraph pole in 10 seconds. What is the speed of the train in km/h?',
                'options': ['54 km/h', '45 km/h', '60 km/h', '72 km/h'],
                'correct': 0,
                'difficulty': 'EASY',
                'explanation': 'Speed in m/s = 150 / 10 = 15 m/s. Speed in km/h = 15 * (18/5) = 54 km/h.'
            },
            {
                'cat': 'quantitative-aptitude',
                'topic': 'Probability',
                'text': 'Two dice are rolled simultaneously. What is the probability of getting a sum divisible by 4?',
                'options': ['1/4', '1/6', '1/3', '5/36'],
                'correct': 0,
                'difficulty': 'MEDIUM',
                'explanation': 'Total outcomes = 36. Favorable outcomes where sum is 4, 8, or 12: (1,3),(2,2),(3,1) -> 3; (2,6),(3,5),(4,4),(5,3),(6,2) -> 5; (6,6) -> 1. Total = 9. P = 9/36 = 1/4.'
            },
            {
                'cat': 'quantitative-aptitude',
                'topic': 'Simple and Compound Interest',
                'text': 'What is the compound interest on $10,000 for 2 years at 10% per annum compounded annually?',
                'options': ['$2,000', '$2,100', '$2,200', '$1,900'],
                'correct': 1,
                'difficulty': 'EASY',
                'explanation': 'A = P(1 + r/100)^t = 10000(1 + 0.1)^2 = 10000 * 1.21 = $12,100. CI = A - P = $2,100.'
            },
            {
                'cat': 'quantitative-aptitude',
                'topic': 'Permutations and Combinations',
                'text': 'In how many different ways can the letters of the word "LEADING" be arranged such that vowels always appear together?',
                'options': ['720', '360', '1440', '2880'],
                'correct': 0,
                'difficulty': 'HARD',
                'explanation': 'Vowels are E, A, I (3 vowels). Consonants are L, D, N, G (4 consonants). Treating the 3 vowels as one unit gives 5 units to arrange: 5! = 120. The 3 vowels can be arranged in 3! = 6 ways. Total = 120 * 6 = 720 ways.'
            },

            # Logical Reasoning
            {
                'cat': 'logical-reasoning',
                'topic': 'Number Series',
                'text': 'Find the missing number in the sequence: 7, 12, 22, 42, 82, ?',
                'options': ['142', '162', '164', '182'],
                'correct': 1,
                'difficulty': 'EASY',
                'explanation': 'The difference doubles each step: +5, +10, +20, +40. The next difference is +80. 82 + 80 = 162.'
            },
            {
                'cat': 'logical-reasoning',
                'topic': 'Blood Relations',
                'text': 'Pointing to a gentleman, Deepak said, "His only brother is the father of my daughter\'s father." How is the gentleman related to Deepak?',
                'options': ['Father', 'Uncle', 'Grandfather', 'Brother-in-law'],
                'correct': 1,
                'difficulty': 'MEDIUM',
                'explanation': 'Daughter\'s father = Deepak himself. The father of Deepak is Deepak\'s father. The gentleman is the only brother of Deepak\'s father, so he is Deepak\'s uncle.'
            },
            {
                'cat': 'logical-reasoning',
                'topic': 'Syllogisms',
                'text': 'Statements: All mangoes are fruits. All fruits are sweet.\nConclusions:\nI. All mangoes are sweet.\nII. Some sweet items are mangoes.',
                'options': ['Only I follows', 'Only II follows', 'Both I and II follow', 'Neither follows'],
                'correct': 2,
                'difficulty': 'EASY',
                'explanation': 'Since Mangoes ⊆ Fruits ⊆ Sweet, all mangoes are definitely sweet (I follows) and sweet items contain mangoes (II follows).'
            },
            {
                'cat': 'logical-reasoning',
                'topic': 'Coding-Decoding',
                'text': 'If SYSTEM is coded as SYSMET and NEARER is coded as AENRER, then FRACTION is coded as:',
                'options': ['CARFTINO', 'CARFNOIT', 'CRAFNOIT', 'FRACNOIT'],
                'correct': 1,
                'difficulty': 'HARD',
                'explanation': 'The 8-letter word is split into two halves of 4 letters: FRAC and TION. First half reversed is CARF; second half reversed is NOIT. Combined = CARFNOIT.'
            },
            {
                'cat': 'logical-reasoning',
                'topic': 'Direction Sense',
                'text': 'A person walks 5 km East, turns right and walks 4 km, then turns left and walks 5 km. In which direction and distance is he from the starting point?',
                'options': ['South-East, 10.77 km', 'North-East, 12 km', 'South, 8 km', 'East, 10 km'],
                'correct': 0,
                'difficulty': 'MEDIUM',
                'explanation': 'Total East = 5 + 5 = 10 km. Total South = 4 km. Distance = sqrt(10^2 + 4^2) = sqrt(116) ≈ 10.77 km South-East.'
            },
            {
                'cat': 'logical-reasoning',
                'topic': 'Seating Arrangement',
                'text': 'Six persons A, B, C, D, E, F are sitting in a circle facing the center. B is between A and C. E is between D and F. D is to the immediate left of A. Who is facing B?',
                'options': ['D', 'E', 'F', 'C'],
                'correct': 1,
                'difficulty': 'HARD',
                'explanation': 'Tracing positions around the circle clockwise: A, B, C, F, E, D. The person opposite to B is E.'
            },
            {
                'cat': 'logical-reasoning',
                'topic': 'Puzzles',
                'text': 'In a family of 6 members A, B, C, D, E, F: there are two married couples. D is grandmother of A and mother of B. C is wife of B and mother of F. F is granddaughter of E. What is the relation of E to A?',
                'options': ['Grandfather', 'Father', 'Brother', 'Uncle'],
                'correct': 0,
                'difficulty': 'MEDIUM',
                'explanation': 'D is the grandmother and mother of B. E is married to D, making E the grandfather of A.'
            },

            # Verbal Ability
            {
                'cat': 'verbal-ability',
                'topic': 'Synonyms & Antonyms',
                'text': 'Choose the word most nearly OPPOSITE in meaning to: PRAGMATIC',
                'options': ['Practical', 'Idealistic', 'Rational', 'Cynical'],
                'correct': 1,
                'difficulty': 'EASY',
                'explanation': 'Pragmatic means dealing with things sensibly and realistically. Its direct antonym is idealistic (guided by ideals rather than practical considerations).'
            },
            {
                'cat': 'verbal-ability',
                'topic': 'Sentence Correction',
                'text': 'Identify the error in the sentence: "Neither the professor nor the students was (A) able to find (B) their classroom keys (C) in the department (D)."',
                'options': ['Part A', 'Part B', 'Part C', 'Part D'],
                'correct': 0,
                'difficulty': 'MEDIUM',
                'explanation': 'When using "neither...nor", the verb agrees with the closer subject ("students", which is plural). Hence, it should be "were able to find", making Part A incorrect.'
            },
            {
                'cat': 'verbal-ability',
                'topic': 'Para Jumbles',
                'text': 'Rearrange the sentences into a coherent paragraph:\n1. This creates an imbalance in resource allocation.\n2. Rapid urbanization has accelerated across developing nations.\n3. Consequently, urban infrastructure faces extreme pressure.\n4. As rural populations migrate in search of economic opportunities.',
                'options': ['2, 4, 3, 1', '4, 2, 1, 3', '2, 1, 4, 3', '3, 2, 4, 1'],
                'correct': 0,
                'difficulty': 'MEDIUM',
                'explanation': 'Sentence 2 introduces the primary subject (urbanization), 4 explains the cause (migration), 3 explains immediate consequence, and 1 summarizes the systemic impact.'
            },
            {
                'cat': 'verbal-ability',
                'topic': 'Fill in the Blanks',
                'text': 'Despite several rounds of negotiations, the two parties failed to reach an ________ agreement.',
                'options': ['amicable', 'adverse', 'ambiguous', 'arduous'],
                'correct': 0,
                'difficulty': 'EASY',
                'explanation': '"Amicable" means characterized by friendliness and absence of discord, which fits the context of constructive negotiations.'
            },
            {
                'cat': 'verbal-ability',
                'topic': 'Reading Comprehension',
                'text': 'Passage: "Autonomous systems rely on continuous feedback loops to calibrate decision thresholds in volatile environments."\nQuestion: What is the primary purpose of continuous feedback loops in the context of the passage?',
                'options': ['To increase latency', 'To adjust decision boundaries dynamically', 'To bypass sensory hardware', 'To terminate running processes'],
                'correct': 1,
                'difficulty': 'EASY',
                'explanation': '"Calibrate decision thresholds in volatile environments" directly translates to adjusting decision boundaries dynamically.'
            },
            {
                'cat': 'verbal-ability',
                'topic': 'Idioms & Phrases',
                'text': 'What is the meaning of the idiom: "Bite the bullet"?',
                'options': ['To surrender unconditionally', 'To face an inevitable grim situation with courage', 'To act impulsively without planning', 'To criticize harshly'],
                'correct': 1,
                'difficulty': 'EASY',
                'explanation': '"Bite the bullet" means to endure a painful or unavoidable situation with bravery and fortitude.'
            },
            {
                'cat': 'verbal-ability',
                'topic': 'Sentence Completion',
                'text': 'The scientist\'s hypothesis was initially met with skepticism, but recent empirical evidence has completely ________ her stance.',
                'options': ['undermined', 'vindicated', 'obscured', 'berated'],
                'correct': 1,
                'difficulty': 'HARD',
                'explanation': '"Vindicated" means cleared of suspicion or proven right by evidence, matching the contrast indicated by "skepticism... but recent evidence".'
            },

            # Data Interpretation
            {
                'cat': 'data-interpretation',
                'topic': 'Bar Charts',
                'text': 'Company revenue over 4 years: 2021: $40M, 2022: $50M, 2023: $65M, 2024: $80M. What is the compound annual percentage increase from 2021 to 2024?',
                'options': ['100%', '80%', '50%', '120%'],
                'correct': 0,
                'difficulty': 'MEDIUM',
                'explanation': 'Percentage increase = ((80 - 40) / 40) * 100 = (40 / 40) * 100 = 100% total revenue growth.'
            },
            {
                'cat': 'data-interpretation',
                'topic': 'Pie Charts',
                'text': 'A student budget pie chart shows: Tuition 40%, Housing 25%, Food 15%, Books 10%, Entertainment 10%. If total expenditure is $20,000, what is the combined amount spent on Housing and Food?',
                'options': ['$6,000', '$8,000', '$7,500', '$9,000'],
                'correct': 1,
                'difficulty': 'EASY',
                'explanation': 'Housing (25%) + Food (15%) = 40% of total budget. 40% of $20,000 = 0.40 * 20000 = $8,000.'
            },
            {
                'cat': 'data-interpretation',
                'topic': 'Tabular Data',
                'text': 'Table of Sales: Product A sold 120 units at $15/unit. Product B sold 80 units at $25/unit. Product C sold 50 units at $40/unit. Which product generated the highest revenue?',
                'options': ['Product A', 'Product B', 'Product C', 'Products B and C tied'],
                'correct': 3,
                'difficulty': 'MEDIUM',
                'explanation': 'Revenue A = 120 * 15 = $1800. Revenue B = 80 * 25 = $2000. Revenue C = 50 * 40 = $2000. Products B and C generated equal highest revenue of $2000.'
            },
            {
                'cat': 'data-interpretation',
                'topic': 'Ratio and Proportions from Charts',
                'text': 'In an engineering college, the ratio of CS to Non-CS students is 3:5. If total number of students is 1600 and 60% of CS students are placed, how many CS students got placed?',
                'options': ['360', '480', '600', '240'],
                'correct': 0,
                'difficulty': 'MEDIUM',
                'explanation': 'CS students = (3 / (3+5)) * 1600 = (3/8) * 1600 = 600. Placed CS students = 60% of 600 = 0.60 * 600 = 360.'
            },
            {
                'cat': 'data-interpretation',
                'topic': 'Line Graphs',
                'text': 'Server uptime recorded over 5 months: Jan (99.2%), Feb (98.5%), Mar (99.8%), Apr (99.1%), May (99.9%). In which month was the downtime the highest?',
                'options': ['January', 'February', 'April', 'March'],
                'correct': 1,
                'difficulty': 'EASY',
                'explanation': 'Highest downtime corresponds to lowest uptime percentage. February had the lowest uptime at 98.5% (1.5% downtime).'
            },
            {
                'cat': 'data-interpretation',
                'topic': 'Multi-variable Analysis',
                'text': 'A manufacturing plant has 3 shifts. Shift 1 produces 500 units with 2% defect rate. Shift 2 produces 400 units with 3% defect rate. Shift 3 produces 300 units with 4% defect rate. What is the overall defect rate?',
                'options': ['2.83%', '3.00%', '2.50%', '3.25%'],
                'correct': 0,
                'difficulty': 'HARD',
                'explanation': 'Total units = 500 + 400 + 300 = 1200. Defective units = (500*0.02) + (400*0.03) + (300*0.04) = 10 + 12 + 12 = 34. Overall defect rate = (34 / 1200) * 100 ≈ 2.83%.'
            },
            {
                'cat': 'quantitative-aptitude',
                'topic': 'Averages',
                'text': 'The average age of a group of 10 students is 20 years. When a teacher joins, the average increases by 2 years. What is the age of the teacher?',
                'options': ['40 years', '42 years', '38 years', '44 years'],
                'correct': 1,
                'difficulty': 'MEDIUM',
                'explanation': 'Total initial age = 10 * 20 = 200. New group size = 11, new average = 22. New total age = 11 * 22 = 242. Teacher age = 242 - 200 = 42 years.'
            },
            {
                'cat': 'quantitative-aptitude',
                'topic': 'Ratios and Mixtures',
                'text': 'A mixture of 40 liters contains milk and water in the ratio 3:1. How much water must be added to make the ratio 2:1?',
                'options': ['5 liters', '4 liters', '6 liters', '3 liters'],
                'correct': 0,
                'difficulty': 'HARD',
                'explanation': 'Initial milk = (3/4)*40 = 30L. Initial water = 10L. Let added water = x. Ratio becomes 30 / (10 + x) = 2/1 => 30 = 20 + 2x => 2x = 10 => x = 5 liters.'
            },
        ]

        for q_data in aptitude_questions:
            cat_obj = cat_objs.get(q_data['cat'])
            if cat_obj:
                AptitudeQuestion.objects.get_or_create(
                    category=cat_obj,
                    question_text=q_data['text'],
                    defaults={
                        'topic': q_data['topic'],
                        'options': q_data['options'],
                        'correct_option_index': q_data['correct'],
                        'explanation': q_data['explanation'],
                        'difficulty': q_data['difficulty'],
                        'marks': 1,
                        'negative_marks': 0.25
                    }
                )

        self.stdout.write(self.style.SUCCESS(f"Seeded {len(aptitude_questions)} Aptitude Questions."))

        # Create Standard Diagnostic Tests
        tests_data = [
            {
                'title': 'Full Campus Placement Diagnostic Mock Test',
                'description': 'Comprehensive 20-minute timed mock covering Quantitative, Logical, Verbal, and Data Interpretation sections.',
                'difficulty': 'MIXED',
                'duration_minutes': 20,
                'total_questions': 15,
                'passing_percentage': 60.0
            },
            {
                'title': 'Quantitative Mastery Assessment',
                'description': 'Targeted test focusing on percentages, arithmetic, time & work, speed and distance.',
                'category': cat_objs.get('quantitative-aptitude'),
                'difficulty': 'MEDIUM',
                'duration_minutes': 15,
                'total_questions': 10,
                'passing_percentage': 65.0
            },
            {
                'title': 'Logical Reasoning & Deduction Speed Drill',
                'description': 'Puzzles, coding-decoding, blood relations, and seating arrangement drill.',
                'category': cat_objs.get('logical-reasoning'),
                'difficulty': 'HARD',
                'duration_minutes': 15,
                'total_questions': 10,
                'passing_percentage': 70.0
            },
        ]

        all_q_ids = list(AptitudeQuestion.objects.all())
        for td in tests_data:
            cat = td.pop('category', None)
            test_obj, _ = AptitudeTest.objects.get_or_create(
                title=td['title'],
                defaults={**td, 'category': cat}
            )
            if cat:
                qs = AptitudeQuestion.objects.filter(category=cat)[:td['total_questions']]
            else:
                qs = AptitudeQuestion.objects.all()[:td['total_questions']]
            test_obj.questions.set(qs)

        # 3. Seed 10 Coding Problems
        coding_problems_data = [
            {
                'title': 'Two Sum',
                'slug': 'two-sum',
                'difficulty': 'EASY',
                'tags': ['Arrays', 'Hash Table', 'Two Pointers'],
                'description': 'Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice. You can return the answer in any order.',
                'input_format': 'First line contains integer N (size of array). Second line contains N space-separated integers. Third line contains integer target.',
                'output_format': 'Two space-separated indices (0-indexed).',
                'constraints': '2 <= nums.length <= 10^4\n-10^9 <= nums[i] <= 10^9\n-10^9 <= target <= 10^9',
                'sample_input': '4\n2 7 11 15\n9',
                'sample_output': '0 1',
                'sample_explanation': 'Because nums[0] + nums[1] == 2 + 7 == 9, we return 0 1.',
                'starter_code': {
                    'python': 'def two_sum(nums, target):\n    # Write your solution here\n    pass\n\nif __name__ == "__main__":\n    import sys\n    lines = sys.stdin.read().split()\n    if lines:\n        n = int(lines[0])\n        nums = [int(x) for x in lines[1:n+1]]\n        target = int(lines[n+1])\n        seen = {}\n        for i, val in enumerate(nums):\n            rem = target - val\n            if rem in seen:\n                print(f"{seen[rem]} {i}")\n                break\n            seen[val] = i\n',
                    'javascript': 'const fs = require("fs");\nconst input = fs.readFileSync(0, "utf-8").trim().split(/\\s+/);\nif (input.length >= 3) {\n  const n = parseInt(input[0]);\n  const nums = input.slice(1, n + 1).map(Number);\n  const target = parseInt(input[n + 1]);\n  const map = new Map();\n  for (let i = 0; i < nums.length; i++) {\n    const rem = target - nums[i];\n    if (map.has(rem)) {\n      console.log(`${map.get(rem)} ${i}`);\n      break;\n    }\n    map.set(nums[i], i);\n  }\n}\n',
                    'cpp': '#include <iostream>\n#include <vector>\n#include <unordered_map>\nusing namespace std;\n\nint main() {\n    int n;\n    if (cin >> n) {\n        vector<int> nums(n);\n        for(int i = 0; i < n; i++) cin >> nums[i];\n        int target;\n        cin >> target;\n        unordered_map<int, int> seen;\n        for(int i = 0; i < n; i++) {\n            int rem = target - nums[i];\n            if(seen.find(rem) != seen.end()) {\n                cout << seen[rem] << " " << i << endl;\n                break;\n            }\n            seen[nums[i]] = i;\n        }\n    }\n    return 0;\n}\n',
                    'java': 'import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNextInt()) {\n            int n = sc.nextInt();\n            int[] nums = new int[n];\n            for (int i = 0; i < n; i++) nums[i] = sc.nextInt();\n            int target = sc.nextInt();\n            Map<Integer, Integer> map = new HashMap<>();\n            for (int i = 0; i < n; i++) {\n                int rem = target - nums[i];\n                if (map.containsKey(rem)) {\n                    System.out.println(map.get(rem) + " " + i);\n                    break;\n                }\n                map.put(nums[i], i);\n            }\n        }\n    }\n}\n'
                },
                'test_cases': [
                    {'input': '4\n2 7 11 15\n9', 'output': '0 1', 'is_hidden': False},
                    {'input': '3\n3 2 4\n6', 'output': '1 2', 'is_hidden': False},
                    {'input': '2\n3 3\n6', 'output': '0 1', 'is_hidden': True},
                    {'input': '5\n1 5 8 12 14\n17', 'output': '1 3', 'is_hidden': True},
                ],
                'points': 20
            },
            {
                'title': 'Valid Anagram',
                'slug': 'valid-anagram',
                'difficulty': 'EASY',
                'tags': ['Strings', 'Hash Table', 'Sorting'],
                'description': 'Given two strings `s` and `t`, return `true` if `t` is an anagram of `s`, and `false` otherwise.\n\nAn Anagram is a word or phrase formed by rearranging the letters of a different word or phrase, typically using all the original letters exactly once.',
                'input_format': 'Two lines of strings s and t.',
                'output_format': 'Print "true" or "false".',
                'constraints': '1 <= s.length, t.length <= 5 * 10^4\ns and t consist of lowercase English letters.',
                'sample_input': 'anagram\nnagaram',
                'sample_output': 'true',
                'sample_explanation': 'Both strings contain the exact same characters with identical frequencies.',
                'starter_code': {
                    'python': 'import sys\nlines = sys.stdin.read().split()\nif len(lines) >= 2:\n    s, t = lines[0], lines[1]\n    print("true" if sorted(s) == sorted(t) else "false")\n',
                    'javascript': 'const fs = require("fs");\nconst [s, t] = fs.readFileSync(0, "utf-8").trim().split(/\\s+/);\nif (s && t) {\n  const sortedS = s.split("").sort().join("");\n  const sortedT = t.split("").sort().join("");\n  console.log(sortedS === sortedT ? "true" : "false");\n}\n',
                    'cpp': '#include <iostream>\n#include <string>\n#include <algorithm>\nusing namespace std;\n\nint main() {\n    string s, t;\n    if (cin >> s >> t) {\n        sort(s.begin(), s.end());\n        sort(t.begin(), t.end());\n        cout << (s == t ? "true" : "false") << endl;\n    }\n    return 0;\n}\n',
                    'java': 'import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNext()) {\n            String s = sc.next();\n            String t = sc.next();\n            char[] a = s.toCharArray();\n            char[] b = t.toCharArray();\n            Arrays.sort(a);\n            Arrays.sort(b);\n            System.out.println(Arrays.equals(a, b) ? "true" : "false");\n        }\n    }\n}\n'
                },
                'test_cases': [
                    {'input': 'anagram\nnagaram', 'output': 'true', 'is_hidden': False},
                    {'input': 'rat\ncar', 'output': 'false', 'is_hidden': False},
                    {'input': 'listen\nsilent', 'output': 'true', 'is_hidden': True},
                    {'input': 'a\nab', 'output': 'false', 'is_hidden': True},
                ],
                'points': 20
            },
            {
                'title': 'Maximum Subarray (Kadane\'s Algorithm)',
                'slug': 'maximum-subarray',
                'difficulty': 'MEDIUM',
                'tags': ['Dynamic Programming', 'Arrays', 'Divide and Conquer'],
                'description': 'Given an integer array `nums`, find the subarray with the largest sum, and return its sum.',
                'input_format': 'First line contains integer N. Second line contains N space-separated integers.',
                'output_format': 'Single integer representing maximum subarray sum.',
                'constraints': '1 <= nums.length <= 10^5\n-10^4 <= nums[i] <= 10^4',
                'sample_input': '9\n-2 1 -3 4 -1 2 1 -5 4',
                'sample_output': '6',
                'sample_explanation': 'The subarray [4,-1,2,1] has the largest sum = 6.',
                'starter_code': {
                    'python': 'import sys\nlines = sys.stdin.read().split()\nif lines:\n    n = int(lines[0])\n    nums = [int(x) for x in lines[1:n+1]]\n    max_sum = curr = nums[0]\n    for x in nums[1:]:\n        curr = max(x, curr + x)\n        max_sum = max(max_sum, curr)\n    print(max_sum)\n',
                    'javascript': 'const fs = require("fs");\nconst input = fs.readFileSync(0, "utf-8").trim().split(/\\s+/);\nif (input.length > 1) {\n  const n = parseInt(input[0]);\n  const nums = input.slice(1, n + 1).map(Number);\n  let maxSum = nums[0];\n  let curr = nums[0];\n  for (let i = 1; i < nums.length; i++) {\n    curr = Math.max(nums[i], curr + nums[i]);\n    maxSum = Math.max(maxSum, curr);\n  }\n  console.log(maxSum);\n}\n',
                    'cpp': '#include <iostream>\n#include <vector>\n#include <algorithm>\nusing namespace std;\n\nint main() {\n    int n;\n    if (cin >> n) {\n        vector<int> nums(n);\n        for(int i = 0; i < n; i++) cin >> nums[i];\n        long long max_sum = nums[0], curr = nums[0];\n        for(int i = 1; i < n; i++) {\n            curr = max((long long)nums[i], curr + nums[i]);\n            max_sum = max(max_sum, curr);\n        }\n        cout << max_sum << endl;\n    }\n    return 0;\n}\n',
                    'java': 'import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNextInt()) {\n            int n = sc.nextInt();\n            int[] nums = new int[n];\n            for (int i = 0; i < n; i++) nums[i] = sc.nextInt();\n            long maxSum = nums[0], curr = nums[0];\n            for (int i = 1; i < n; i++) {\n                curr = Math.max(nums[i], curr + nums[i]);\n                maxSum = Math.max(maxSum, curr);\n            }\n            System.out.println(maxSum);\n        }\n    }\n}\n'
                },
                'test_cases': [
                    {'input': '9\n-2 1 -3 4 -1 2 1 -5 4', 'output': '6', 'is_hidden': False},
                    {'input': '1\n1', 'output': '1', 'is_hidden': False},
                    {'input': '5\n5 4 -1 7 8', 'output': '23', 'is_hidden': True},
                    {'input': '4\n-5 -2 -8 -1', 'output': '-1', 'is_hidden': True},
                ],
                'points': 50
            },
            {
                'title': 'Longest Substring Without Repeating Characters',
                'slug': 'longest-substring-without-repeating-characters',
                'difficulty': 'MEDIUM',
                'tags': ['Sliding Window', 'Strings', 'Hash Table'],
                'description': 'Given a string `s`, find the length of the longest substring without repeating characters.',
                'input_format': 'A single line containing string s.',
                'output_format': 'Integer representing length of longest unique substring.',
                'constraints': '0 <= s.length <= 5 * 10^4',
                'sample_input': 'abcabcbb',
                'sample_output': '3',
                'sample_explanation': 'The answer is "abc", with length of 3.',
                'starter_code': {
                    'python': 'import sys\nline = sys.stdin.read().strip()\nchar_map = {}\nleft = max_len = 0\nfor right, ch in enumerate(line):\n    if ch in char_map and char_map[ch] >= left:\n        left = char_map[ch] + 1\n    char_map[ch] = right\n    max_len = max(max_len, right - left + 1)\nprint(max_len)\n',
                    'javascript': 'const fs = require("fs");\nconst s = fs.readFileSync(0, "utf-8").trim();\nlet maxLen = 0, left = 0;\nconst map = new Map();\nfor (let right = 0; right < s.length; right++) {\n  const ch = s[right];\n  if (map.has(ch) && map.get(ch) >= left) {\n    left = map.get(ch) + 1;\n  }\n  map.set(ch, right);\n  maxLen = Math.max(maxLen, right - left + 1);\n}\nconsole.log(maxLen);\n',
                    'cpp': '#include <iostream>\n#include <string>\n#include <unordered_map>\n#include <algorithm>\nusing namespace std;\n\nint main() {\n    string s;\n    if (getline(cin, s)) {\n        unordered_map<char, int> mp;\n        int left = 0, max_len = 0;\n        for (int right = 0; right < s.length(); right++) {\n            if (mp.count(s[right]) && mp[s[right]] >= left) {\n                left = mp[s[right]] + 1;\n            }\n            mp[s[right]] = right;\n            max_len = max(max_len, right - left + 1);\n        }\n        cout << max_len << endl;\n    } else {\n        cout << 0 << endl;\n    }\n    return 0;\n}\n',
                    'java': 'import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        String s = sc.hasNextLine() ? sc.nextLine() : "";\n        Map<Character, Integer> map = new HashMap<>();\n        int left = 0, maxLen = 0;\n        for (int right = 0; right < s.length(); right++) {\n            char ch = s.charAt(right);\n            if (map.containsKey(ch) && map.get(ch) >= left) {\n                left = map.get(ch) + 1;\n            }\n            map.put(ch, right);\n            maxLen = Math.max(maxLen, right - left + 1);\n        }\n        System.out.println(maxLen);\n    }\n}\n'
                },
                'test_cases': [
                    {'input': 'abcabcbb', 'output': '3', 'is_hidden': False},
                    {'input': 'bbbbb', 'output': '1', 'is_hidden': False},
                    {'input': 'pwwkew', 'output': '3', 'is_hidden': True},
                    {'input': 'placementready', 'output': '10', 'is_hidden': True},
                ],
                'points': 50
            },
            {
                'title': 'Valid Parentheses',
                'slug': 'valid-parentheses',
                'difficulty': 'EASY',
                'tags': ['Stack', 'Strings'],
                'description': 'Given a string `s` containing just the characters `(`, `)`, `{`, `}`, `[` and `]`, determine if the input string is valid.\n\nAn input string is valid if open brackets are closed by the same type of brackets and closed in the correct order.',
                'input_format': 'A single line containing bracket string s.',
                'output_format': '"true" or "false".',
                'constraints': '1 <= s.length <= 10^4',
                'sample_input': '()[]{}',
                'sample_output': 'true',
                'sample_explanation': 'All brackets are matched and closed in proper order.',
                'starter_code': {
                    'python': 'import sys\ns = sys.stdin.read().strip()\nstack = []\nmapping = {")": "(", "}": "{", "]": "["}\nvalid = True\nfor ch in s:\n    if ch in mapping.values():\n        stack.append(ch)\n    elif ch in mapping:\n        if not stack or stack.pop() != mapping[ch]:\n            valid = False\n            break\n    else:\n        valid = False\n        break\nprint("true" if valid and not stack else "false")\n',
                    'javascript': 'const fs = require("fs");\nconst s = fs.readFileSync(0, "utf-8").trim();\nconst stack = [];\nconst map = {")": "(", "}": "{", "]": "["};\nlet valid = true;\nfor (const ch of s) {\n  if (ch === "(" || ch === "{" || ch === "[") {\n    stack.push(ch);\n  } else if (map[ch]) {\n    if (stack.length === 0 || stack.pop() !== map[ch]) {\n      valid = false;\n      break;\n    }\n  }\n}\nconsole.log(valid && stack.length === 0 ? "true" : "false");\n',
                    'cpp': '#include <iostream>\n#include <stack>\n#include <string>\nusing namespace std;\n\nint main() {\n    string s;\n    if (cin >> s) {\n        stack<char> st;\n        bool ok = true;\n        for (char c : s) {\n            if (c == \'(\' || c == \'{\' || c == \'[\') st.push(c);\n            else {\n                if (st.empty()) { ok = false; break; }\n                char top = st.top(); st.pop();\n                if (c == \')\' && top != \'(\') { ok = false; break; }\n                if (c == \'}\' && top != \'{\') { ok = false; break; }\n                if (c == \']\' && top != \'[\') { ok = false; break; }\n            }\n        }\n        cout << (ok && st.empty() ? "true" : "false") << endl;\n    }\n    return 0;\n}\n',
                    'java': 'import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNext()) {\n            String s = sc.next();\n            Stack<Character> st = new Stack<>();\n            boolean ok = true;\n            for (char c : s.toCharArray()) {\n                if (c == \'(\' || c == \'{\' || c == \'[\') st.push(c);\n                else {\n                    if (st.isEmpty()) { ok = false; break; }\n                    char top = st.pop();\n                    if (c == \')\' && top != \'(\') { ok = false; break; }\n                    if (c == \'}\' && top != \'{\') { ok = false; break; }\n                    if (c == \']\' && top != \'[\') { ok = false; break; }\n                }\n            }\n            System.out.println(ok && st.isEmpty() ? "true" : "false");\n        }\n    }\n}\n'
                },
                'test_cases': [
                    {'input': '()[]{}', 'output': 'true', 'is_hidden': False},
                    {'input': '(]', 'output': 'false', 'is_hidden': False},
                    {'input': '([{}])', 'output': 'true', 'is_hidden': True},
                    {'input': '((', 'output': 'false', 'is_hidden': True},
                ],
                'points': 20
            },
            {
                'title': 'Coin Change',
                'slug': 'coin-change',
                'difficulty': 'MEDIUM',
                'tags': ['Dynamic Programming', 'Breadth-First Search'],
                'description': 'You are given an integer array `coins` representing coins of different denominations and an integer `amount` representing a total amount of money.\n\nReturn the fewest number of coins that you need to make up that amount. If that amount of money cannot be made up by any combination of the coins, return `-1`.',
                'input_format': 'First line contains integer N (number of coins) and integer Amount. Second line contains N coin denominations.',
                'output_format': 'Single integer representing minimum coins or -1.',
                'constraints': '1 <= coins.length <= 12\n1 <= coins[i] <= 2^31 - 1\n0 <= amount <= 10^4',
                'sample_input': '3 11\n1 2 5',
                'sample_output': '3',
                'sample_explanation': '11 = 5 + 5 + 1 (3 coins)',
                'starter_code': {
                    'python': 'import sys\nlines = sys.stdin.read().split()\nif lines:\n    n, amount = int(lines[0]), int(lines[1])\n    coins = [int(x) for x in lines[2:2+n]]\n    dp = [float("inf")] * (amount + 1)\n    dp[0] = 0\n    for c in coins:\n        for a in range(c, amount + 1):\n            dp[a] = min(dp[a], dp[a - c] + 1)\n    print(dp[amount] if dp[amount] != float("inf") else -1)\n',
                    'javascript': 'const fs = require("fs");\nconst input = fs.readFileSync(0, "utf-8").trim().split(/\\s+/);\nif (input.length >= 2) {\n  const n = parseInt(input[0]);\n  const amount = parseInt(input[1]);\n  const coins = input.slice(2, 2 + n).map(Number);\n  const dp = new Array(amount + 1).fill(Infinity);\n  dp[0] = 0;\n  for (const c of coins) {\n    for (let a = c; a <= amount; a++) {\n      dp[a] = Math.min(dp[a], dp[a - c] + 1);\n    }\n  }\n  console.log(dp[amount] === Infinity ? -1 : dp[amount]);\n}\n',
                    'cpp': '#include <iostream>\n#include <vector>\n#include <algorithm>\nusing namespace std;\n\nint main() {\n    int n, amount;\n    if (cin >> n >> amount) {\n        vector<int> coins(n);\n        for(int i = 0; i < n; i++) cin >> coins[i];\n        vector<int> dp(amount + 1, 1e9);\n        dp[0] = 0;\n        for(int c : coins) {\n            for(int a = c; a <= amount; a++) {\n                dp[a] = min(dp[a], dp[a - c] + 1);\n            }\n        }\n        cout << (dp[amount] >= 1e9 ? -1 : dp[amount]) << endl;\n    }\n    return 0;\n}\n',
                    'java': 'import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNextInt()) {\n            int n = sc.nextInt();\n            int amount = sc.nextInt();\n            int[] coins = new int[n];\n            for (int i = 0; i < n; i++) coins[i] = sc.nextInt();\n            int[] dp = new int[amount + 1];\n            Arrays.fill(dp, 1000000);\n            dp[0] = 0;\n            for (int c : coins) {\n                for (int a = c; a <= amount; a++) {\n                    dp[a] = Math.min(dp[a], dp[a - c] + 1);\n                }\n            }\n            System.out.println(dp[amount] >= 1000000 ? -1 : dp[amount]);\n        }\n    }\n}\n'
                },
                'test_cases': [
                    {'input': '3 11\n1 2 5', 'output': '3', 'is_hidden': False},
                    {'input': '1 3\n2', 'output': '-1', 'is_hidden': False},
                    {'input': '1 0\n1', 'output': '0', 'is_hidden': True},
                    {'input': '4 6249\n186 419 83 408', 'output': '20', 'is_hidden': True},
                ],
                'points': 50
            },
            {
                'title': 'Trapping Rain Water',
                'slug': 'trapping-rain-water',
                'difficulty': 'HARD',
                'tags': ['Two Pointers', 'Dynamic Programming', 'Stack'],
                'description': 'Given `n` non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.',
                'input_format': 'First line contains integer N. Second line contains N space-separated elevation values.',
                'output_format': 'Single integer representing total trapped water.',
                'constraints': 'n == height.length\n1 <= n <= 2 * 10^4\n0 <= height[i] <= 10^5',
                'sample_input': '12\n0 1 0 2 1 0 1 3 2 1 2 1',
                'sample_output': '6',
                'sample_explanation': 'Elevation map traps 6 units of rain water.',
                'starter_code': {
                    'python': 'import sys\nlines = sys.stdin.read().split()\nif lines:\n    n = int(lines[0])\n    h = [int(x) for x in lines[1:n+1]]\n    left, right = 0, n - 1\n    left_max = right_max = water = 0\n    while left < right:\n        if h[left] < h[right]:\n            if h[left] >= left_max: left_max = h[left]\n            else: water += left_max - h[left]\n            left += 1\n        else:\n            if h[right] >= right_max: right_max = h[right]\n            else: water += right_max - h[right]\n            right -= 1\n    print(water)\n',
                    'javascript': 'const fs = require("fs");\nconst input = fs.readFileSync(0, "utf-8").trim().split(/\\s+/);\nif (input.length > 1) {\n  const n = parseInt(input[0]);\n  const h = input.slice(1, n + 1).map(Number);\n  let left = 0, right = n - 1, leftMax = 0, rightMax = 0, water = 0;\n  while (left < right) {\n    if (h[left] < h[right]) {\n      if (h[left] >= leftMax) leftMax = h[left];\n      else water += leftMax - h[left];\n      left++;\n    } else {\n      if (h[right] >= rightMax) rightMax = h[right];\n      else water += rightMax - h[right];\n      right--;\n    }\n  }\n  console.log(water);\n}\n',
                    'cpp': '#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    int n;\n    if (cin >> n) {\n        vector<int> h(n);\n        for(int i = 0; i < n; i++) cin >> h[i];\n        int left = 0, right = n - 1, left_max = 0, right_max = 0, water = 0;\n        while (left < right) {\n            if (h[left] < h[right]) {\n                if (h[left] >= left_max) left_max = h[left];\n                else water += left_max - h[left];\n                left++;\n            } else {\n                if (h[right] >= right_max) right_max = h[right];\n                else water += right_max - h[right];\n                right--;\n            }\n        }\n        cout << water << endl;\n    }\n    return 0;\n}\n',
                    'java': 'import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNextInt()) {\n            int n = sc.nextInt();\n            int[] h = new int[n];\n            for (int i = 0; i < n; i++) h[i] = sc.nextInt();\n            int left = 0, right = n - 1, leftMax = 0, rightMax = 0, water = 0;\n            while (left < right) {\n                if (h[left] < h[right]) {\n                    if (h[left] >= leftMax) leftMax = h[left];\n                    else water += leftMax - h[left];\n                    left++;\n                } else {\n                    if (h[right] >= rightMax) rightMax = h[right];\n                    else water += rightMax - h[right];\n                    right--;\n                }\n            }\n            System.out.println(water);\n        }\n    }\n}\n'
                },
                'test_cases': [
                    {'input': '12\n0 1 0 2 1 0 1 3 2 1 2 1', 'output': '6', 'is_hidden': False},
                    {'input': '6\n4 2 0 3 2 5', 'output': '9', 'is_hidden': False},
                    {'input': '3\n2 0 2', 'output': '2', 'is_hidden': True},
                    {'input': '5\n3 0 0 2 0 4', 'output': '10', 'is_hidden': True},
                ],
                'points': 100
            },
            {
                'title': 'Merge Intervals',
                'slug': 'merge-intervals',
                'difficulty': 'MEDIUM',
                'tags': ['Arrays', 'Sorting'],
                'description': 'Given an array of `intervals` where `intervals[i] = [start_i, end_i]`, merge all overlapping intervals, and return an array of the non-overlapping intervals that cover all the intervals in the input.',
                'input_format': 'First line integer N. Next N lines each contain two space-separated integers start and end.',
                'output_format': 'Each merged interval on a new line formatted as "start end".',
                'constraints': '1 <= intervals.length <= 10^4\n0 <= start_i <= end_i <= 10^4',
                'sample_input': '4\n1 3\n2 6\n8 10\n15 18',
                'sample_output': '1 6\n8 10\n15 18',
                'sample_explanation': 'Since intervals [1,3] and [2,6] overlap, merge them into [1,6].',
                'starter_code': {
                    'python': 'import sys\nlines = sys.stdin.read().split()\nif lines:\n    n = int(lines[0])\n    intervals = []\n    for i in range(n):\n        intervals.append([int(lines[1 + 2*i]), int(lines[2 + 2*i])])\n    intervals.sort(key=lambda x: x[0])\n    merged = [intervals[0]]\n    for cur in intervals[1:]:\n        if cur[0] <= merged[-1][1]:\n            merged[-1][1] = max(merged[-1][1], cur[1])\n        else:\n            merged.append(cur)\n    for m in merged:\n        print(f"{m[0]} {m[1]}")\n',
                    'javascript': 'const fs = require("fs");\nconst input = fs.readFileSync(0, "utf-8").trim().split(/\\s+/);\nif (input.length > 1) {\n  const n = parseInt(input[0]);\n  const intervals = [];\n  for (let i = 0; i < n; i++) {\n    intervals.push([parseInt(input[1 + 2*i]), parseInt(input[2 + 2*i])]);\n  }\n  intervals.sort((a, b) => a[0] - b[0]);\n  const merged = [intervals[0]];\n  for (let i = 1; i < intervals.length; i++) {\n    const cur = intervals[i];\n    if (cur[0] <= merged[merged.length - 1][1]) {\n      merged[merged.length - 1][1] = Math.max(merged[merged.length - 1][1], cur[1]);\n    } else {\n      merged.push(cur);\n    }\n  }\n  merged.forEach(m => console.log(`${m[0]} ${m[1]}`));\n}\n',
                    'cpp': '#include <iostream>\n#include <vector>\n#include <algorithm>\nusing namespace std;\n\nint main() {\n    int n;\n    if (cin >> n) {\n        vector<pair<int,int>> arr(n);\n        for(int i = 0; i < n; i++) cin >> arr[i].first >> arr[i].second;\n        sort(arr.begin(), arr.end());\n        vector<pair<int,int>> merged = {arr[0]};\n        for(int i = 1; i < n; i++) {\n            if (arr[i].first <= merged.back().second) {\n                merged.back().second = max(merged.back().second, arr[i].second);\n            } else {\n                merged.push_back(arr[i]);\n            }\n        }\n        for(auto& p : merged) cout << p.first << " " << p.second << endl;\n    }\n    return 0;\n}\n',
                    'java': 'import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNextInt()) {\n            int n = sc.nextInt();\n            int[][] arr = new int[n][2];\n            for (int i = 0; i < n; i++) { arr[i][0] = sc.nextInt(); arr[i][1] = sc.nextInt(); }\n            Arrays.sort(arr, (a, b) -> Integer.compare(a[0], b[0]));\n            List<int[]> merged = new ArrayList<>();\n            merged.add(arr[0]);\n            for (int i = 1; i < n; i++) {\n                int[] last = merged.get(merged.size() - 1);\n                if (arr[i][0] <= last[1]) {\n                    last[1] = Math.max(last[1], arr[i][1]);\n                } else {\n                    merged.add(arr[i]);\n                }\n            }\n            for (int[] m : merged) System.out.println(m[0] + " " + m[1]);\n        }\n    }\n}\n'
                },
                'test_cases': [
                    {'input': '4\n1 3\n2 6\n8 10\n15 18', 'output': '1 6\n8 10\n15 18', 'is_hidden': False},
                    {'input': '2\n1 4\n4 5', 'output': '1 5', 'is_hidden': False},
                    {'input': '3\n1 4\n2 3\n5 8', 'output': '1 4\n5 8', 'is_hidden': True},
                ],
                'points': 50
            },
            {
                'title': 'Binary Search',
                'slug': 'binary-search',
                'difficulty': 'EASY',
                'tags': ['Binary Search', 'Arrays'],
                'description': 'Given an array of integers `nums` which is sorted in ascending order, and an integer `target`, write a function to search `target` in `nums`. If `target` exists, then return its index. Otherwise, return `-1`.\n\nYou must write an algorithm with `O(log n)` runtime complexity.',
                'input_format': 'First line integer N and target T. Second line contains N sorted integers.',
                'output_format': 'Index of target or -1.',
                'constraints': '1 <= nums.length <= 10^4\n-10^4 < nums[i], target < 10^4\nAll the integers in nums are unique.',
                'sample_input': '6 9\n-1 0 3 5 9 12',
                'sample_output': '4',
                'sample_explanation': '9 exists in nums and its index is 4.',
                'starter_code': {
                    'python': 'import sys\nlines = sys.stdin.read().split()\nif lines:\n    n, target = int(lines[0]), int(lines[1])\n    nums = [int(x) for x in lines[2:2+n]]\n    left, right = 0, n - 1\n    ans = -1\n    while left <= right:\n        mid = (left + right) // 2\n        if nums[mid] == target:\n            ans = mid\n            break\n        elif nums[mid] < target: left = mid + 1\n        else: right = mid - 1\n    print(ans)\n',
                    'javascript': 'const fs = require("fs");\nconst input = fs.readFileSync(0, "utf-8").trim().split(/\\s+/);\nif (input.length >= 2) {\n  const n = parseInt(input[0]);\n  const target = parseInt(input[1]);\n  const nums = input.slice(2, 2 + n).map(Number);\n  let left = 0, right = n - 1, ans = -1;\n  while (left <= right) {\n    const mid = Math.floor((left + right) / 2);\n    if (nums[mid] === target) { ans = mid; break; }\n    else if (nums[mid] < target) left = mid + 1;\n    else right = mid - 1;\n  }\n  console.log(ans);\n}\n',
                    'cpp': '#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    int n, target;\n    if (cin >> n >> target) {\n        vector<int> nums(n);\n        for(int i = 0; i < n; i++) cin >> nums[i];\n        int left = 0, right = n - 1, ans = -1;\n        while (left <= right) {\n            int mid = left + (right - left)/2;\n            if (nums[mid] == target) { ans = mid; break; }\n            else if (nums[mid] < target) left = mid + 1;\n            else right = mid - 1;\n        }\n        cout << ans << endl;\n    }\n    return 0;\n}\n',
                    'java': 'import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNextInt()) {\n            int n = sc.nextInt();\n            int target = sc.nextInt();\n            int[] nums = new int[n];\n            for (int i = 0; i < n; i++) nums[i] = sc.nextInt();\n            int left = 0, right = n - 1, ans = -1;\n            while (left <= right) {\n                int mid = left + (right - left)/2;\n                if (nums[mid] == target) { ans = mid; break; }\n                else if (nums[mid] < target) left = mid + 1;\n                else right = mid - 1;\n            }\n            System.out.println(ans);\n        }\n    }\n}\n'
                },
                'test_cases': [
                    {'input': '6 9\n-1 0 3 5 9 12', 'output': '4', 'is_hidden': False},
                    {'input': '6 2\n-1 0 3 5 9 12', 'output': '-1', 'is_hidden': False},
                    {'input': '1 5\n5', 'output': '0', 'is_hidden': True},
                    {'input': '5 100\n10 20 30 40 50', 'output': '-1', 'is_hidden': True},
                ],
                'points': 20
            },
            {
                'title': 'Rotate Array',
                'slug': 'rotate-array',
                'difficulty': 'MEDIUM',
                'tags': ['Arrays', 'Two Pointers'],
                'description': 'Given an integer array `nums`, rotate the array to the right by `k` steps, where `k` is non-negative.',
                'input_format': 'First line integer N and K. Second line contains N space-separated integers.',
                'output_format': 'Space-separated integers representing the rotated array.',
                'constraints': '1 <= nums.length <= 10^5\n-2^31 <= nums[i] <= 2^31 - 1\n0 <= k <= 10^5',
                'sample_input': '7 3\n1 2 3 4 5 6 7',
                'sample_output': '5 6 7 1 2 3 4',
                'sample_explanation': 'Rotated 1 step: [7,1,2,3,4,5,6], 2 steps: [6,7,1,2,3,4,5], 3 steps: [5,6,7,1,2,3,4].',
                'starter_code': {
                    'python': 'import sys\nlines = sys.stdin.read().split()\nif lines:\n    n, k = int(lines[0]), int(lines[1])\n    nums = [int(x) for x in lines[2:2+n]]\n    k = k % n\n    nums = nums[-k:] + nums[:-k] if k > 0 else nums\n    print(" ".join(map(str, nums)))\n',
                    'javascript': 'const fs = require("fs");\nconst input = fs.readFileSync(0, "utf-8").trim().split(/\\s+/);\nif (input.length >= 2) {\n  const n = parseInt(input[0]);\n  const k = parseInt(input[1]) % n;\n  const nums = input.slice(2, 2 + n).map(Number);\n  const rotated = k > 0 ? nums.slice(n - k).concat(nums.slice(0, n - k)) : nums;\n  console.log(rotated.join(" "));\n}\n',
                    'cpp': '#include <iostream>\n#include <vector>\n#include <algorithm>\nusing namespace std;\n\nint main() {\n    int n, k;\n    if (cin >> n >> k) {\n        vector<int> nums(n);\n        for(int i = 0; i < n; i++) cin >> nums[i];\n        k %= n;\n        reverse(nums.begin(), nums.end());\n        reverse(nums.begin(), nums.begin() + k);\n        reverse(nums.begin() + k, nums.end());\n        for(int i = 0; i < n; i++) cout << nums[i] << (i == n-1 ? "" : " ");\n        cout << endl;\n    }\n    return 0;\n}\n',
                    'java': 'import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNextInt()) {\n            int n = sc.nextInt();\n            int k = sc.nextInt() % n;\n            int[] nums = new int[n];\n            for (int i = 0; i < n; i++) nums[i] = sc.nextInt();\n            int[] res = new int[n];\n            for (int i = 0; i < n; i++) res[(i + k) % n] = nums[i];\n            for (int i = 0; i < n; i++) System.out.print(res[i] + (i == n-1 ? "" : " "));\n            System.out.println();\n        }\n    }\n}\n'
                },
                'test_cases': [
                    {'input': '7 3\n1 2 3 4 5 6 7', 'output': '5 6 7 1 2 3 4', 'is_hidden': False},
                    {'input': '4 2\n-1 -100 3 99', 'output': '3 99 -1 -100', 'is_hidden': False},
                    {'input': '3 0\n1 2 3', 'output': '1 2 3', 'is_hidden': True},
                ],
                'points': 50
            },
        ]

        for p_data in coding_problems_data:
            CodingProblem.objects.get_or_create(
                slug=p_data['slug'],
                defaults=p_data
            )

        self.stdout.write(self.style.SUCCESS(f"Seeded {len(coding_problems_data)} Coding Problems."))

        # 4. Seed Interview Categories & 20 Questions
        interview_cats = [
            {'name': 'HR Interview', 'slug': 'hr-interview', 'description': 'Personality, culture fit, career aspirations, and behavioral alignment.', 'icon': 'UserCheck', 'order': 1},
            {'name': 'Technical Interview', 'slug': 'technical-interview', 'description': 'Core CS fundamentals, OOP, databases, system design, and algorithms.', 'icon': 'Code', 'order': 2},
            {'name': 'Behavioral Interview', 'slug': 'behavioral-interview', 'description': 'STAR methodology responses for teamwork, conflict resolution, and leadership.', 'icon': 'Users', 'order': 3},
            {'name': 'Resume-based Interview', 'slug': 'resume-interview', 'description': 'Deep-dive questions targeting academic projects, internships, and tools listed.', 'icon': 'FileText', 'order': 4},
            {'name': 'Programming Interview', 'slug': 'programming-interview', 'description': 'Code design patterns, debugging methodology, API principles, and testing.', 'icon': 'Terminal', 'order': 5},
            {'name': 'Company-specific Interview', 'slug': 'company-specific', 'description': 'Tailored questions commonly asked at top tech enterprises and startups.', 'icon': 'Building', 'order': 6},
        ]

        int_cat_map = {}
        for ic in interview_cats:
            obj, _ = InterviewCategory.objects.get_or_create(
                slug=ic['slug'],
                defaults=ic
            )
            int_cat_map[ic['slug']] = obj

        interview_questions_data = [
            # HR
            {
                'cat': 'hr-interview',
                'q': 'Tell me about yourself and walk me through your journey in computer science.',
                'ans': 'I am a final-year Computer Science student with a strong foundation in full-stack web development and data structures. Over the past 3 years, I have built several projects using React, Django, and PostgreSQL, including real-time applications and microservices. Alongside academics, I have maintained an active coding practice on competitive platforms and completed an internship where I contributed to backend REST APIs. I am eager to apply my problem-solving skills to build scalable products in a high-impact engineering team.',
                'tips': 'Structure your answer using the Present-Past-Future framework. Highlight passion, core achievements, and why you are excited for this role.',
                'points': ['Present academic status & core tech stack', 'Key projects & internship experience', 'Problem solving commitment', 'Career alignment with company'],
                'difficulty': 'EASY',
                'company': 'General'
            },
            {
                'cat': 'hr-interview',
                'q': 'Where do you see yourself in 5 years?',
                'ans': 'In 5 years, I see myself as a Senior Software Engineer or Technical Lead. I aim to master distributed systems and system architecture while mentoring junior engineers. I want to be someone trusted to architect end-to-end features and drive business-critical engineering decisions.',
                'tips': 'Demonstrate ambition, commitment to skill mastery, and desire for progressive responsibility without sounding unrealistically overconfident.',
                'points': ['Technical mastery in distributed systems', 'Leadership & mentorship aspirations', 'Impact on business-critical systems'],
                'difficulty': 'EASY',
                'company': 'General'
            },
            {
                'cat': 'hr-interview',
                'q': 'What are your greatest strengths and greatest areas for improvement?',
                'ans': 'My greatest strength is rapid problem breakdown and structured execution—when encountering ambiguous bugs, I methodically isolate variables and write unit tests. An area I actively work on is delegating tasks and not over-optimizing early prototypes; I have learned to prioritize minimum viable solutions and iterate based on benchmark metrics.',
                'tips': 'Pair genuine strengths with actionable examples, and present a real weakness alongside the concrete steps you are taking to overcome it.',
                'points': ['Structured analytical problem solving', 'Self-awareness of perfectionism/over-engineering', 'Proactive remediation steps'],
                'difficulty': 'MEDIUM',
                'company': 'General'
            },
            {
                'cat': 'hr-interview',
                'q': 'Why do you want to join our organization specifically?',
                'ans': 'I have closely followed your organization\'s engineering breakthroughs in handling high-concurrency traffic and scalable cloud platforms. Your culture of engineering excellence and continuous learning aligns perfectly with my goal to contribute to scalable distributed products while learning from experienced senior mentors.',
                'tips': 'Mention specific company products, engineering blogs, or cultural values. Avoid generic praise.',
                'points': ['Company engineering culture', 'Scalability/high-impact projects', 'Continuous learning environment'],
                'difficulty': 'MEDIUM',
                'company': 'Amazon / Google'
            },

            # Technical
            {
                'cat': 'technical-interview',
                'q': 'Explain the four core principles of Object-Oriented Programming (OOP) with practical analogies.',
                'ans': 'The four pillars of OOP are:\n1. Encapsulation: Bundling data and methods operating on that data within a single class while restricting direct external access (e.g. private fields in a BankAccount class).\n2. Abstraction: Hiding internal implementation complexities and exposing only high-level interfaces (e.g. driving a car by pressing the accelerator without needing to manually manage fuel injection).\n3. Inheritance: Enabling child classes to inherit attributes and methods from parent classes to promote code reuse (e.g. Dog inheriting from Animal).\n4. Polymorphism: Allowing entities to take multiple forms through method overriding or overloading (e.g. a render() method behaving differently in Circle and Square classes).',
                'tips': 'Clearly state all four pillars with concise definitions followed by clean real-world code analogies.',
                'points': ['Encapsulation & data hiding', 'Abstraction & interface separation', 'Inheritance & code reuse', 'Polymorphism (runtime & compile time)'],
                'difficulty': 'EASY',
                'company': 'Microsoft / TCS'
            },
            {
                'cat': 'technical-interview',
                'q': 'What is the difference between SQL and NoSQL databases, and when would you choose one over the other?',
                'ans': 'SQL databases (like PostgreSQL, MySQL) are relational, table-based, enforce strict schemas, and follow ACID guarantees, making them ideal for complex relational queries, financial transactions, and structured data with referential integrity. NoSQL databases (like MongoDB, Redis, Cassandra) are non-relational, document/key-value/columnar based, offer dynamic schemas, and follow BASE/horizontal scaling, making them suitable for unstructured data, real-time caching, and high-velocity write throughput.',
                'tips': 'Compare schema strictness, ACID vs BASE, vertical vs horizontal scaling, and give clear use-case recommendations.',
                'points': ['Relational schema vs Document/Key-Value', 'ACID compliance vs BASE', 'Horizontal vs Vertical scaling', 'Concrete use cases'],
                'difficulty': 'MEDIUM',
                'company': 'Amazon / Infosys'
            },
            {
                'cat': 'technical-interview',
                'q': 'Explain how database indexing works internally (B-Trees) and what are its trade-offs.',
                'ans': 'Database indexes use balanced tree data structures (typically B+ Trees) to allow O(log N) lookup times instead of O(N) full-table scans. In a B+ Tree, leaf nodes contain data pointers and are linked sequentially for efficient range queries. The trade-offs are: indexes consume additional disk storage, and every INSERT, UPDATE, or DELETE operation incurs overhead because the index tree must be rebalanced.',
                'tips': 'Explain B+ Tree hierarchy, range query optimization, and the performance cost on write-heavy workloads.',
                'points': ['B+ Tree structure and O(log N) search', 'Range query efficiency via linked leaves', 'Storage overhead', 'Write penalty (INSERT/UPDATE slowdown)'],
                'difficulty': 'HARD',
                'company': 'Google / Uber'
            },
            {
                'cat': 'technical-interview',
                'q': 'What is the Virtual DOM in React, and how does the Reconciliation diffing algorithm work?',
                'ans': 'The Virtual DOM is a lightweight JavaScript representation of the actual DOM in memory. When state or props change, React creates a new Virtual DOM tree, compares it with the previous snapshot using its heuristic O(N) diffing algorithm (Reconciliation), calculates the minimum batch of mutations, and efficiently updates only the modified elements in the real DOM.',
                'tips': 'Mention lightweight in-memory tree, batch updates, O(N) diffing heuristics, and real DOM painting efficiency.',
                'points': ['In-memory JS object representation', 'Diffing algorithm & Reconciliation', 'Batch DOM updates', 'Minimizing browser reflow/repaint'],
                'difficulty': 'MEDIUM',
                'company': 'Meta / Atlassian'
            },

            # Behavioral
            {
                'cat': 'behavioral-interview',
                'q': 'Describe a situation where you had a disagreement with a teammate during a project. How did you handle it?',
                'ans': 'Situation: During a capstone project, our team disagreed on whether to use GraphQL or standard REST APIs. Task: We needed to establish a unified architecture without stalling development. Action: I scheduled a short design review where we benchmarked both options against our project constraints. I demonstrated that our endpoints were simple CRUD and REST would allow us to ship 2 weeks faster with existing team expertise. Result: The team unanimously agreed on REST, and we successfully delivered the project on time.',
                'tips': 'Always format behavioral answers with the STAR method (Situation, Task, Action, Result). Emphasize data-driven, objective consensus.',
                'points': ['Clear Situation and conflicting views', 'Action taken (design spike/benchmarks)', 'Collaborative consensus building', 'Measurable positive outcome'],
                'difficulty': 'MEDIUM',
                'company': 'Amazon'
            },
            {
                'cat': 'behavioral-interview',
                'q': 'Tell me about a time you made a significant mistake or missed a deadline. What did you learn?',
                'ans': 'Situation: During a hackathon, I pushed a database migration script without backing up sample data, causing table lockouts. Task: I needed to restore database availability immediately. Action: I communicated transparently with the team, rolled back the migration, rebuilt the test fixtures, and added an automated backup script before subsequent migrations. Result: We resolved the issue in 30 minutes, and the safety checklist prevented any future downtime.',
                'tips': 'Own the mistake without blaming others. Focus heavily on immediate containment and permanent preventive measures.',
                'points': ['Ownership without excuses', 'Transparent communication', 'Immediate remediation', 'Systemic preventive learning'],
                'difficulty': 'MEDIUM',
                'company': 'Google'
            },
            {
                'cat': 'behavioral-interview',
                'q': 'Give an example of how you handled working under tight deadlines or high academic pressure.',
                'ans': 'During final semester exams, I had to deliver a major capstone module while preparing for 4 technical subjects. I broke down deliverables into daily time-boxed Kanban tickets, automated our integration test suite to catch regressions early, and prioritized high-impact tasks. As a result, our team secured an \'A\' grade and met every release milestone.',
                'tips': 'Highlight prioritization techniques, stress management, automation, and consistent output.',
                'points': ['Time management & prioritization', 'Decomposition of large goals', 'Automation to reduce cognitive load', 'Successful end result'],
                'difficulty': 'EASY',
                'company': 'General'
            },

            # Resume-based
            {
                'cat': 'resume-interview',
                'q': 'Walk me through the most technically challenging project on your resume. What was the architecture and your primary contribution?',
                'ans': 'My most challenging project was a Placement Preparation Portal featuring real-time code execution, NLP resume parsing, and analytics. I architected the backend with Django REST Framework, implemented secure token-based JWT authentication, and integrated the Judge0 engine for sandboxed multi-language code compilation. I also engineered an NLP parsing pipeline using TF-IDF and regex to analyze ATS compatibility and job description semantic match.',
                'tips': 'State the high-level architecture first, followed by your specific technical ownership, difficult roadblocks overcome, and quantitative results.',
                'points': ['High-level architecture & stack rationale', 'Specific engineering ownership', 'Key technical hurdle overcome', 'Performance or usability results'],
                'difficulty': 'MEDIUM',
                'company': 'General'
            },
            {
                'cat': 'resume-interview',
                'q': 'Why did you choose Django and React over alternative technology stacks for your project?',
                'ans': 'I selected React on the frontend for its declarative component lifecycle, modular state management, and vibrant ecosystem (Monaco Editor, Recharts). On the backend, Django and Django REST Framework provided robust ORM capabilities, built-in security protections against CSRF/SQL injection, seamless integration with Python\'s rich NLP libraries (scikit-learn, pdfplumber), and rapid development velocity.',
                'tips': 'Compare pros and cons of chosen stack against alternatives (e.g. Node vs Python, Vue vs React).',
                'points': ['React component modularity & ecosystem', 'Django ORM & security robustness', 'Python NLP ecosystem synergy', 'Development speed & maintainability'],
                'difficulty': 'EASY',
                'company': 'General'
            },

            # Programming Interview
            {
                'cat': 'programming-interview',
                'q': 'How would you identify and optimize a slow-performing database query in a production application?',
                'ans': 'First, I would inspect the query execution plan using EXPLAIN ANALYZE to identify sequential scans, high-cost joins, or sorting bottlenecks. Next, I would verify whether appropriate indexes exist on foreign keys and filter columns. If queries still lag, I would eliminate N+1 queries using eager loading (e.g., select_related / prefetch_related), select only required columns instead of SELECT *, and introduce a Redis caching layer for frequently read, seldom-modified queries.',
                'tips': 'Follow a systematic diagnostic flow: Logging/Profiling -> EXPLAIN ANALYZE -> Indexing -> ORM Optimization -> Caching.',
                'points': ['EXPLAIN ANALYZE profiling', 'Index optimization on WHERE/JOIN columns', 'Eager loading / resolving N+1 queries', 'Redis caching layer'],
                'difficulty': 'HARD',
                'company': 'Microsoft / Uber'
            },
            {
                'cat': 'programming-interview',
                'q': 'Explain the principles of RESTful API design and standard HTTP status code conventions.',
                'ans': 'RESTful APIs treat data as resources identified by URI paths and manipulated via standard HTTP verbs: GET for reading, POST for creation, PUT/PATCH for updates, and DELETE for removal. Standard status codes include: 200 OK / 201 Created for success, 400 Bad Request for validation failures, 401 Unauthorized (missing authentication), 403 Forbidden (insufficient permissions), 404 Not Found, and 500 Internal Server Error. REST also emphasizes statelessness and idempotent operations where appropriate.',
                'tips': 'Explain resource-centric URLs, idempotency of GET/PUT/DELETE, and key 2xx, 4xx, and 5xx status codes.',
                'points': ['Resource-oriented URIs and HTTP verbs', 'Statelessness & idempotency', 'Status code classifications (200, 201, 400, 401, 403, 404, 500)', 'Clean JSON error envelopes'],
                'difficulty': 'EASY',
                'company': 'General'
            },

            # Company-specific
            {
                'cat': 'company-specific',
                'q': 'How would you design a distributed Rate Limiter for an API gateway?',
                'ans': 'I would implement a Token Bucket or Sliding Window Log algorithm utilizing Redis as an in-memory centralized counter store. Each incoming client request (identified by API key or IP address) executes an atomic Redis Lua script that checks the current token count and timestamp. If tokens remain, the request proceeds and the count decrements; otherwise, it returns HTTP 429 Too Many Requests with a Retry-After header.',
                'tips': 'Mention Token Bucket vs Leaky Bucket vs Sliding Window, centralized Redis with Lua scripts for atomicity, and HTTP 429 headers.',
                'points': ['Algorithm choice (Token Bucket / Sliding Window)', 'Distributed Redis cache with atomic Lua execution', 'Client identification (API Key / IP)', 'HTTP 429 Too Many Requests response with retry headers'],
                'difficulty': 'HARD',
                'company': 'Google / Amazon / Uber'
            },
            {
                'cat': 'company-specific',
                'q': 'How does asynchronous execution and Event Loop work in Node.js / JavaScript?',
                'ans': 'JavaScript is single-threaded and utilizes an Event Loop model powered by libuv to handle non-blocking I/O. Asynchronous operations (timers, network requests, disk I/O) are offloaded to system kernel threads or worker pools. When operations complete, their callbacks are placed in queues (Microtask queue for Promises, Macrotask queue for setTimeout). The Event Loop continuously checks the call stack and dequeues callbacks as soon as the stack is empty.',
                'tips': 'Explain Call Stack, Web APIs/Libuv, Microtask vs Macrotask queue priority, and non-blocking I/O.',
                'points': ['Single-threaded call stack', 'Libuv thread pool for background I/O', 'Microtask (Promises) vs Macrotask (Timers) priority', 'Non-blocking concurrency'],
                'difficulty': 'MEDIUM',
                'company': 'Atlassian / Flipkart'
            },
            {
                'cat': 'company-specific',
                'q': 'Explain the difference between Process and Thread, and how inter-process communication (IPC) works.',
                'ans': 'A Process is an independent executing program with its own dedicated virtual memory space, file descriptors, and security context. A Thread is a lightweight execution unit within a process that shares the parent process\'s memory, code, and global variables with other threads in the same process. Threads communicate easily via shared memory but require synchronization primitives (mutexes, semaphores) to prevent race conditions. Processes communicate through IPC mechanisms like pipes, sockets, message queues, or shared memory.',
                'tips': 'Highlight memory isolation vs shared memory, context switching overhead, and synchronization primitives.',
                'points': ['Memory isolation in processes vs shared memory in threads', 'Context switching cost difference', 'Synchronization primitives (Mutex, Semaphore)', 'IPC mechanisms (Sockets, Pipes, Message Queues)'],
                'difficulty': 'MEDIUM',
                'company': 'Microsoft / Qualcomm'
            },
            {
                'cat': 'company-specific',
                'q': 'How would you handle cache invalidation and cache consistency in a high-traffic microservices architecture?',
                'ans': 'I would combine a Cache-Aside (Lazy Loading) pattern with Write-Through or Write-Behind caching depending on latency requirements. For consistency, whenever write mutations occur in the primary database, the service invalidates or updates the corresponding Redis key. To guard against race conditions and stale reads, I would set appropriate Time-To-Live (TTL) expiration on keys and utilize distributed cache-invalidation events broadcast over a pub/sub message bus like Kafka or Redis Pub/Sub.',
                'tips': 'Discuss Cache-Aside pattern, TTL expiration safety net, write-through vs write-back, and event-driven invalidation via message brokers.',
                'points': ['Cache-Aside / Write-Through strategies', 'Mandatory TTL expiration', 'Event-driven invalidation via Kafka / PubSub', 'Handling Cache Stampede and Cache Penetration'],
                'difficulty': 'HARD',
                'company': 'Amazon / Netflix'
            },
            {
                'cat': 'company-specific',
                'q': 'What is ACID in databases, and how does each property protect data integrity?',
                'ans': 'ACID represents:\n1. Atomicity: All operations in a transaction either succeed completely or are rolled back entirely (all-or-nothing).\n2. Consistency: Ensures transactions transition the database from one valid state to another, respecting all constraints and foreign keys.\n3. Isolation: Concurrent transactions execute independently without interfering with each other (managed via isolation levels like Read Committed or Serializable).\n4. Durability: Once a transaction commits, its changes survive system crashes or power failures through write-ahead logging (WAL).',
                'tips': 'Define each acronym letter clearly and mention Write-Ahead Logging (WAL) for durability and isolation levels.',
                'points': ['Atomicity (All or nothing rollback)', 'Consistency (Constraint enforcement)', 'Isolation levels (Read Committed, Repeatable Read, Serializable)', 'Durability via Write-Ahead Logging'],
                'difficulty': 'MEDIUM',
                'company': 'Oracle / Morgan Stanley'
            },
        ]

        for iq in interview_questions_data:
            cat_obj = int_cat_map.get(iq['cat'])
            if cat_obj:
                InterviewQuestion.objects.get_or_create(
                    category=cat_obj,
                    question=iq['q'],
                    defaults={
                        'model_answer': iq['ans'],
                        'tips': iq['tips'],
                        'key_talking_points': iq['points'],
                        'difficulty': iq['difficulty'],
                        'company_tag': iq['company']
                    }
                )

        self.stdout.write(self.style.SUCCESS(f"Seeded {len(interview_questions_data)} Interview Questions."))
        self.stdout.write(self.style.SUCCESS("All seed data successfully populated!"))
