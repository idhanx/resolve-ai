from ai.alert_service import alert_service

analysis = {

    "businessImpact":{

        "priority":"Critical"

    },

    "alerts":{

        "severity":"Critical"

    }

}

result = alert_service.generate_alert(

    analysis=analysis,

    confidence=96.7,

    history_found=True,

    similar_cases=5

)

print(result)