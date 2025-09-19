import { ReviewIssue, Severity } from '../types';

const severityConfig: Record<Severity, { emoji: string; title: string }> = {
  [Severity.Critical]: { emoji: '🔴', title: 'Critical' },
  [Severity.Major]: { emoji: '🟠', title: 'Major' },
  [Severity.Minor]: { emoji: '🟡', title: 'Minor' },
  [Severity.Info]: { emoji: '🔵', title: 'Info' },
};

export const generateMarkdownReport = (review: ReviewIssue[]): string => {
  if (!review || review.length === 0) {
    return '# AI Code Review Report\n\nNo issues found. Great job!';
  }

  const sections: Record<string, string[]> = {
    [Severity.Critical]: [],
    [Severity.Major]: [],
    [Severity.Minor]: [],
    [Severity.Info]: [],
  };

  const counts: Record<string, number> = {
    [Severity.Critical]: 0,
    [Severity.Major]: 0,
    [Severity.Minor]: 0,
    [Severity.Info]: 0,
  };

  review.forEach(issue => {
    counts[issue.severity]++;
    const issueMd = [
      `### Issue on Line(s): \`${issue.line}\``,
      `**Description:** ${issue.description}`,
      `**Suggestion:**`,
      '```',
      issue.suggestion,
      '```',
    ].join('\n\n');
    sections[issue.severity].push(issueMd);
  });

  let markdown = '# AI Code Review Report\n\n';

  // Summary
  markdown += '## Summary\n\n';
  const severities = [Severity.Critical, Severity.Major, Severity.Minor, Severity.Info];
  markdown += '| Severity | Count |\n';
  markdown += '|:---|:---|\n';
  severities.forEach(s => {
    if (counts[s] > 0) {
      markdown += `| ${severityConfig[s].emoji} **${s}** | ${counts[s]} |\n`;
    }
  });
  markdown += '\n';

  // Detailed Issues
  markdown += '## Detailed Issues\n\n';

  severities.forEach(s => {
    if (sections[s].length > 0) {
      markdown += `## ${severityConfig[s].emoji} ${s} Issues\n\n`;
      markdown += sections[s].join('\n\n---\n\n');
      markdown += '\n\n';
    }
  });

  return markdown.trim();
};
