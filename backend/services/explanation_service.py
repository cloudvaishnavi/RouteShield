def explain_prediction(raw_data, prediction_result):
    contribs = prediction_result.get('contributions', [])
    return {
        'main_factors': contribs[:5]
    }
