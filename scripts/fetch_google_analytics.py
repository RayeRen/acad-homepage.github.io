import json
import os
from pathlib import Path

from google.analytics.data_v1beta import BetaAnalyticsDataClient
from google.analytics.data_v1beta.types import DateRange, Metric, RunReportRequest
from google.oauth2 import service_account


def main():
    credentials_info = json.loads(os.environ["GA_SERVICE_ACCOUNT_JSON"])
    credentials = service_account.Credentials.from_service_account_info(
        credentials_info,
        scopes=["https://www.googleapis.com/auth/analytics.readonly"],
    )
    client = BetaAnalyticsDataClient(credentials=credentials)
    request = RunReportRequest(
        property=f"properties/{os.environ['GA_PROPERTY_ID']}",
        metrics=[Metric(name="screenPageViews"), Metric(name="totalUsers")],
        date_ranges=[DateRange(start_date="2015-08-14", end_date="today")],
    )
    response = client.run_report(request)
    values = response.rows[0].metric_values
    stats = {
        "views": int(values[0].value),
        "visitors": int(values[1].value),
    }

    output_path = Path("_data/ga_stats.json")
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(json.dumps(stats, indent=2) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()